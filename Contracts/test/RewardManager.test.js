// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("RewardManager", function () {
//     let rewardManager;
//     let owner;
//     let otherAccount;
//     let thirdAccount;
//     const ONE_ETH = ethers.parseEther("1.0");

//     async function deployRewardManagerFixture() {
//         const [owner, otherAccount, thirdAccount] = await ethers.getSigners();
//         const RewardManager = await ethers.getContractFactory("RewardManager");
//         const rewardManager = await RewardManager.deploy();
//         return { rewardManager, owner, otherAccount, thirdAccount };
//     }

//     beforeEach(async function () {
//         ({ rewardManager, owner, otherAccount, thirdAccount } = await deployRewardManagerFixture());
//     });

//     describe("Deployment", function () {
//         it("Should set the right owner", async function () {
//             expect(await rewardManager.owner()).to.equal(owner.address);
//         });

//         it("Should start uninitialized", async function () {
//             expect(await rewardManager.initialized()).to.be.false;
//         });
//     });

//     describe("Initialization", function () {
//         it("Should initialize with correct percentages", async function () {
//             const addresses = [otherAccount.address, thirdAccount.address];
//             const percentages = [6000, 4000]; // 60.00% and 40.00%

//             await rewardManager.initialize(addresses, percentages);
            
//             expect(await rewardManager.initialized()).to.be.true;
//             expect(await rewardManager.percentageShares(otherAccount.address)).to.equal(6000);
//             expect(await rewardManager.percentageShares(thirdAccount.address)).to.equal(4000);
//             expect(await rewardManager.totalPercentage()).to.equal(10000);
//         });

//         it("Should initialize with small percentages", async function () {
//             const addresses = [otherAccount.address, thirdAccount.address];
//             const percentages = [1, 9999]; // 0.01% and 99.99%

//             await rewardManager.initialize(addresses, percentages);
            
//             expect(await rewardManager.initialized()).to.be.true;
//             expect(await rewardManager.percentageShares(otherAccount.address)).to.equal(1);
//             expect(await rewardManager.percentageShares(thirdAccount.address)).to.equal(9999);
//             expect(await rewardManager.totalPercentage()).to.equal(10000);
//         });

//         it("Should fail if total percentage is not 10000", async function () {
//             const addresses = [otherAccount.address, thirdAccount.address];
//             const percentages = [6000, 3000]; // Only 90%

//             await expect(
//                 rewardManager.initialize(addresses, percentages)
//             ).to.be.revertedWith("Total percentage must be 10000");
//         });

//         it("Should fail if arrays length mismatch", async function () {
//             const addresses = [otherAccount.address, thirdAccount.address];
//             const percentages = [6000]; // Only one percentage

//             await expect(
//                 rewardManager.initialize(addresses, percentages)
//             ).to.be.revertedWith("Arrays length mismatch");
//         });

//         it("Should fail if non-owner tries to initialize", async function () {
//             const addresses = [otherAccount.address, thirdAccount.address];
//             const percentages = [6000, 4000];

//             await expect(
//                 rewardManager.connect(otherAccount).initialize(addresses, percentages)
//             ).to.be.revertedWith("Only owner can call this function");
//         });

//         it("Should fail if already initialized", async function () {
//             const addresses = [otherAccount.address, thirdAccount.address];
//             const percentages = [6000, 4000];

//             await rewardManager.initialize(addresses, percentages);

//             await expect(
//                 rewardManager.initialize(addresses, percentages)
//             ).to.be.revertedWith("Already initialized");
//         });
//     });

//     describe("Reward Distribution", function () {
//         beforeEach(async function () {
//             const addresses = [otherAccount.address, thirdAccount.address];
//             const percentages = [6000, 4000]; // 60.00% and 40.00%
//             await rewardManager.initialize(addresses, percentages);
//         });

//         it("Should distribute rewards according to percentages", async function () {
//             await owner.sendTransaction({
//                 to: rewardManager.target,
//                 value: ONE_ETH
//             });

//             const otherAccountEarnings = await rewardManager.userEarnings(otherAccount.address);
//             const thirdAccountEarnings = await rewardManager.userEarnings(thirdAccount.address);

//             expect(otherAccountEarnings).to.equal(ethers.parseEther("0.6")); // 60% of 1 ETH
//             expect(thirdAccountEarnings).to.equal(ethers.parseEther("0.4")); // 40% of 1 ETH
//         });

//         it("Should handle small percentage distributions", async function () {
//             const addresses = [otherAccount.address, thirdAccount.address];
//             const percentages = [1, 9999]; // 0.01% and 99.99%
//             await rewardManager.initialize(addresses, percentages);

//             await owner.sendTransaction({
//                 to: rewardManager.target,
//                 value: ONE_ETH
//             });

//             const otherAccountEarnings = await rewardManager.userEarnings(otherAccount.address);
//             const thirdAccountEarnings = await rewardManager.userEarnings(thirdAccount.address);

//             expect(otherAccountEarnings).to.equal(ethers.parseEther("0.0001")); // 0.01% of 1 ETH
//             expect(thirdAccountEarnings).to.equal(ethers.parseEther("0.9999")); // 99.99% of 1 ETH
//         });

//         it("Should fail to receive ETH if not initialized", async function () {
//             const newRewardManager = await ethers.deployContract("RewardManager");
            
//             await expect(
//                 owner.sendTransaction({
//                     to: newRewardManager.target,
//                     value: ONE_ETH
//                 })
//             ).to.be.revertedWith("Contract not initialized");
//         });
//     });

//     describe("Claims", function () {
//         beforeEach(async function () {
//             const addresses = [otherAccount.address, thirdAccount.address];
//             const percentages = [6000, 4000]; // 60.00% and 40.00%
//             await rewardManager.initialize(addresses, percentages);
            
//             // Send 1 ETH to the contract
//             await owner.sendTransaction({
//                 to: rewardManager.target,
//                 value: ONE_ETH
//             });
//         });

//         it("Should allow users to claim their earnings", async function () {
//             const initialBalance = await ethers.provider.getBalance(otherAccount.address);
            
//             const tx = await rewardManager.connect(otherAccount).claim(ethers.parseEther("0.6"));
//             const receipt = await tx.wait();
            
//             const finalBalance = await ethers.provider.getBalance(otherAccount.address);
//             const gasCost = receipt.gasUsed * receipt.gasPrice;
            
//             // Check if balance increased by 0.6 ETH minus gas costs
//             expect(finalBalance - initialBalance).to.equal(ethers.parseEther("0.6") - gasCost);
            
//             // Check if earnings were reduced
//             expect(await rewardManager.userEarnings(otherAccount.address)).to.equal(0);
//         });

//         it("Should fail if trying to claim more than available", async function () {
//             await expect(
//                 rewardManager.connect(otherAccount).claim(ethers.parseEther("0.7"))
//             ).to.be.revertedWith("Insufficient earnings");
//         });

//         it("Should fail if trying to claim 0", async function () {
//             await expect(
//                 rewardManager.connect(otherAccount).claim(0)
//             ).to.be.revertedWith("Amount must be greater than 0");
//         });

//         it("Should fail if trying to claim before initialization", async function () {
//             const newRewardManager = await ethers.deployContract("RewardManager");
            
//             await expect(
//                 newRewardManager.connect(otherAccount).claim(ethers.parseEther("0.1"))
//             ).to.be.revertedWith("Contract not initialized");
//         });
//     });

//     describe("Earnings Queries", function () {
//         beforeEach(async function () {
//             const addresses = [otherAccount.address, thirdAccount.address];
//             const percentages = [6000, 4000]; // 60.00% and 40.00%
//             await rewardManager.initialize(addresses, percentages);
//         });

//         it("Should return correct earnings for users", async function () {
//             await owner.sendTransaction({
//                 to: rewardManager.target,
//                 value: ONE_ETH
//             });

//             const earnings = await rewardManager.getUserEarnings(otherAccount.address);
//             expect(earnings).to.equal(ethers.parseEther("0.6"));
//         });

//         it("Should return 0 for users with no earnings", async function () {
//             const earnings = await rewardManager.getUserEarnings(owner.address);
//             expect(earnings).to.equal(0);
//         });
//     });
// }); 