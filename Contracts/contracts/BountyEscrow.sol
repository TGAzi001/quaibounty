// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title BountyEscrow
 * @notice escrow for GitHub issue bounties with integrated fee vault.
 *
 *         Sponsor funds a bounty; a designated resolver can settle to a recipient before the deadline;
 *         sponsors can cancel or refund after deadline. Owner sets fee params, can pause,
 *         and can withdraw only protocol fees (not active escrow).
 */
contract BountyEscrow is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    /// @notice Maximum protocol fee in basis points (200 = 2%).
    uint16 public constant MAX_FEE_BPS = 200;

    /// @dev Basis point denominator (10_000 = 100%).
    uint256 private constant FEE_DENOM = 10_000;

    enum Status {
        None,
        Open,
        Resolved,
        Refunded,
        Canceled
    }

    struct Bounty {
        bytes32 repoIdHash;
        address sponsor;
        uint96 amount;      // net bounty amount (paid in full to recipient)
        uint256 deadline;
        uint64 issueNumber;
        Status status;
    }

    // -------- Storage --------

    /// @dev BountyId (keccak256(sponsor, repoIdHash, issueNumber)) → Bounty.
    mapping(bytes32 => Bounty) private _bounties;

    /// @notice Protocol fee in basis points (out of 10_000).
    uint16 public feeBps;

    /// @notice Total net bounty principal currently locked in active (Open) bounties.
    uint256 public totalEscrowed;

    /// @notice Cumulative fees accrued over the lifetime of the contract (informational, fees accrue at funding).
    uint256 public totalFeesAccrued;

    // -------- Events --------

    event BountyCreated(
        bytes32 indexed bountyId,
        address indexed sponsor,
        bytes32 indexed repoIdHash,
        uint64 issueNumber,
        uint256 amount
    );

    event Funded(bytes32 indexed bountyId, uint256 newAmount);

    event Resolved(
        bytes32 indexed bountyId,
        address indexed recipient,
        uint256 net,
        uint256 fee
    );

    event Canceled(
        bytes32 indexed bountyId,
        address indexed sponsor,
        uint256 amount
    );

    event Refunded(
        bytes32 indexed bountyId,
        address indexed sponsor,
        uint256 amount
    );

    event FeeBpsUpdated(uint16 feeBps);

    event FeesWithdrawn(address indexed to, uint256 amount);

    event TokenRescued(address indexed token, address indexed to, uint256 amount);

    event NativeDeposited(address indexed from, uint256 amount);

    event NativeSwept(address indexed to, uint256 amount);

    // -------- Errors --------

    error InvalidParams();
    error AlreadyExists();
    error NotOpen();
    error NotSponsor();
    error NotResolver();
    error DeadlineNotReached();
    error ZeroAddress();
    error ZeroAmount();
    error NoFeesAvailable();
    error InsufficientFees();

    // -------- Constructor --------

    /**
     * @param _feeBps Initial protocol fee in basis points (≤ MAX_FEE_BPS).
     * @param initialOwner Contract owner (admin for pause/fees/withdraw).
     */
    constructor(
        uint16 _feeBps,
        address initialOwner
    ) Ownable(initialOwner) {
        if (_feeBps > MAX_FEE_BPS) revert InvalidParams();

        feeBps = _feeBps;
    }

    // -------- Pure / View Utilities --------

    function computeBountyId(
        bytes32 repoIdHash,
        uint64 issueNumber
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(repoIdHash, issueNumber));
    }

    function getBounty(bytes32 bountyId) external view returns (Bounty memory) {
        return _bounties[bountyId];
    }

    // -------- Admin: Pause / Fees --------

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setFeeBps(uint16 _feeBps) external onlyOwner {
        if (_feeBps > MAX_FEE_BPS) revert InvalidParams();
        feeBps = _feeBps;
        emit FeeBpsUpdated(_feeBps);
    }

    // -------- Core Flows --------

    function createBounty(
        bytes32 repoIdHash,
        uint64 issueNumber
    ) external onlyOwner nonReentrant whenNotPaused returns (bytes32 bountyId) {
        if (repoIdHash == bytes32(0) || issueNumber == 0) revert InvalidParams();

        bountyId = computeBountyId(repoIdHash, issueNumber);
        if (_bounties[bountyId].status != Status.None) revert AlreadyExists();

        Bounty storage b = _bounties[bountyId];
        b.repoIdHash = repoIdHash;
        b.sponsor = address(0);
        b.deadline = block.timestamp + 30 days;
        b.issueNumber = issueNumber;
        b.status = Status.Open;

        emit BountyCreated(
            bountyId,
            address(0),
            repoIdHash,
            issueNumber,
            0
        );
    }

    function fund(
        bytes32 bountyId
    ) external payable nonReentrant whenNotPaused {
        Bounty storage b = _bounties[bountyId];
        if (b.status != Status.Open) revert NotOpen();

        uint256 newAmt = uint256(b.amount) + msg.value;
        if (newAmt > type(uint96).max) revert InvalidParams();
        b.amount = uint96(newAmt);
        b.sponsor = msg.sender;

        totalEscrowed += msg.value;

        uint256 fee = (msg.value * feeBps) / FEE_DENOM;

        if (fee > 0) {
            totalFeesAccrued += fee;
        }

        emit Funded(bountyId, newAmt);
    }

    function resolve(
        bytes32 bountyId,
        address recipient
    ) external onlyOwner nonReentrant whenNotPaused {
        if (recipient == address(0)) revert ZeroAddress();

        Bounty storage b = _bounties[bountyId];
        if (b.status != Status.Open) revert NotOpen();

        b.status = Status.Resolved;
        uint256 gross = b.amount;
        b.amount = 0;

        if (gross > 0) {
            totalEscrowed -= gross;
        }

        uint256 fee = (gross * feeBps) / FEE_DENOM;
        uint256 net = gross - fee;

        if (net > 0) {
            payable(recipient).transfer(net);
        }

        emit Resolved(bountyId, recipient, net, fee);
    }

    function cancel(bytes32 bountyId) external nonReentrant whenNotPaused {
        Bounty storage b = _bounties[bountyId];
        if (b.status != Status.Open) revert NotOpen();

        b.status = Status.Canceled;
        uint256 gross = b.amount;
        b.amount = 0;

        if (gross > 0) {
            totalEscrowed -= gross;
            payable(b.sponsor).transfer(gross);
        }

        emit Canceled(bountyId, b.sponsor, gross);
    }

    function refundExpired(
        bytes32 bountyId
    ) external nonReentrant whenNotPaused {
        Bounty storage b = _bounties[bountyId];
        if (b.status != Status.Open) revert NotOpen();
        if (block.timestamp < b.deadline) revert DeadlineNotReached();
        if (msg.sender != b.sponsor) revert NotSponsor();

        b.status = Status.Refunded;
        uint256 gross = b.amount;
        b.amount = 0;

        if (gross > 0) {
            totalEscrowed -= gross;
            payable(b.sponsor).transfer(gross);
        }

        emit Refunded(bountyId, b.sponsor, gross);
    }

    // -------- Fees & Vault Logic (Integrated) --------

    /**
     * @notice Returns the amount of currently available protocol fees.
     * @dev Computed as contract balance - totalEscrowed. Fees are collected
     *      at funding time, so this excludes active bounty principal.
     */
    function availableFees() public view returns (uint256) {
        uint256 balance = address(this).balance;
        if (balance <= totalEscrowed) {
            return 0;
        }
        return balance - totalEscrowed;
    }

    /**
     * @notice Withdraw accumulated protocol fees.
     * @dev Only owner. Cannot withdraw escrowed funds.
     *      This is allowed even while the contract is paused.
     *
     * @param to Recipient address.
     * @param amount Amount to withdraw. If 0, withdraws full availableFees().
     */
    function withdrawFees(
        address to,
        uint256 amount
    ) external onlyOwner nonReentrant {
        if (to == address(0)) revert ZeroAddress();

        uint256 available = availableFees();
        if (available == 0) revert NoFeesAvailable();

        if (amount == 0) {
            amount = available;
        } else if (amount > available) {
            revert InsufficientFees();
        }

        payable(to).transfer(amount);
        emit FeesWithdrawn(to, amount);
    }

    /**
     * @notice Rescue arbitrary ERC-20 tokens accidentally sent to this contract.
     * @dev Only owner. Cannot be used for the native token.
     */
    function rescueToken(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner nonReentrant {
        if (token == address(0) || to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        IERC20(token).safeTransfer(to, amount);
        emit TokenRescued(token, to, amount);
    }

    receive() external payable {
        emit NativeDeposited(msg.sender, msg.value);
    }
}
