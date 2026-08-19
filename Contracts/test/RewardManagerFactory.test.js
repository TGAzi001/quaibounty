// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("RewardManagerFactory", function () {
//     let factory;
//     let owner;
//     let otherAccount;

//     async function deployFactoryFixture() {
//         const [owner, otherAccount] = await ethers.getSigners();
//         const RewardManagerFactory = await ethers.getContractFactory("RewardManagerFactory");
//         const factory = await RewardManagerFactory.deploy();
//         return { factory, owner, otherAccount };
//     }

//     beforeEach(async function () {
//         ({ factory, owner, otherAccount } = await deployFactoryFixture());
//     });

//     describe("Deployment", function () {
//         it("Should set the right owner", async function () {
//             expect(await factory.owner()).to.equal(owner.address);
//         });

//         it("Should start with no deployed contracts", async function () {
//             const contracts = await factory.getAllDeployedContracts();
//             expect(contracts.length).to.equal(0);
//         });
//     });

//     describe("RewardManager Deployment", function () {
//         it("Should deploy a new RewardManager contract", async function () {
//             const tx = await factory.deployRewardManager();
//             const receipt = await tx.wait();
            
//             // Check if event was emitted
//             const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'RewardManagerDeployed');
//             expect(event).to.not.be.undefined;
            
//             const contracts = await factory.getAllDeployedContracts();
//             expect(contracts.length).to.equal(1);
//         });

//         it("Should mark deployed contract as not used initially", async function () {
//             await factory.deployRewardManager();
//             const contracts = await factory.getAllDeployedContracts();
//             const isUsed = await factory.isUsed(contracts[0]);
//             expect(isUsed).to.be.false;
//         });

//         it("Should fail if non-owner tries to deploy", async function () {
//             await expect(
//                 factory.connect(otherAccount).deployRewardManager()
//             ).to.be.revertedWith("Only owner can call this function");
//         });
//     });

//     describe("Contract Management", function () {
//         it("Should get latest unused contract", async function () {
//             await factory.deployRewardManager();
//             const latestContract = await factory.getLatestUnusedContract();
//             expect(latestContract).to.not.equal(ethers.ZeroAddress);
//         });

//         it("Should return zero address if no unused contracts", async function () {
//             await factory.deployRewardManager();
//             const contracts = await factory.getAllDeployedContracts();
//             await factory.markContractAsUsed(contracts[0]);
            
//             const latestContract = await factory.getLatestUnusedContract();
//             expect(latestContract).to.equal(ethers.ZeroAddress);
//         });

//         it("Should mark contract as used", async function () {
//             await factory.deployRewardManager();
//             const contracts = await factory.getAllDeployedContracts();
            
//             await factory.markContractAsUsed(contracts[0]);
//             const isUsed = await factory.isUsed(contracts[0]);
//             expect(isUsed).to.be.true;
//         });

//         it("Should fail to mark non-existent contract as used", async function () {
//             await expect(
//                 factory.markContractAsUsed(otherAccount.address)
//             ).to.be.revertedWith("Contract not deployed");
//         });

//         it("Should fail if non-owner tries to mark contract as used", async function () {
//             await factory.deployRewardManager();
//             const contracts = await factory.getAllDeployedContracts();
            
//             await expect(
//                 factory.connect(otherAccount).markContractAsUsed(contracts[0])
//             ).to.be.revertedWith("Only owner can call this function");
//         });
//     });

//     describe("Contract Listing", function () {
//         it("Should list all deployed contracts", async function () {
//             await factory.deployRewardManager();
//             await factory.deployRewardManager();
            
//             const contracts = await factory.getAllDeployedContracts();
//             expect(contracts.length).to.equal(2);
//         });
//     });
// }); 