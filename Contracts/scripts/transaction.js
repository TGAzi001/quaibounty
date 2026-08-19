const quais = require('quais')
const EscrowJson = require('../artifacts/contracts/BountyEscrow.sol/BountyEscrow.json')
const { deployMetadata } = require("hardhat");
require('dotenv').config()

// Pull contract arguments from .env
const escrowArgs = [200, "0x003d07aa34acaF9C71f4E787c16687E70856d2e4"]

async function deployEscrow() {
  // Config provider, wallet, and contract factory
  const provider = new quais.JsonRpcProvider(hre.network.config.url, undefined, { usePathing: true })
  const wallet = new quais.Wallet(hre.network.config.accounts[0], provider)
  const Escrow = new quais.Contract("0x0041Dfeb51aFB837505568DEbf45114efD127009", EscrowJson.abi, wallet);
  const repoIdHash = quais.id("repo-12345");
  
  const tx = await Escrow.createBounty(repoIdHash, 1);
  await tx.wait();

  // Broadcast deploy transaction
//   const escrow = await Escrow.deploy(...escrowArgs)
//   console.log('Transaction broadcasted: ', escrow.deploymentTransaction().hash)

//   // Wait for contract to be deployed
//   await escrow.waitForDeployment()
//   console.log('Contract deployed to: ', await escrow.getAddress())
    console.log('Transaction called')
}

deployEscrow()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })