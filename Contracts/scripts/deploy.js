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
  const ipfsHash = await deployMetadata.pushMetadataToIPFS("BountyEscrow")
  const Escrow = new quais.ContractFactory(EscrowJson.abi, EscrowJson.bytecode, wallet, ipfsHash)

  // Broadcast deploy transaction
  const escrow = await Escrow.deploy(...escrowArgs)
  console.log('Transaction broadcasted: ', escrow.deploymentTransaction().hash)

  // Wait for contract to be deployed
  await escrow.waitForDeployment()
  console.log('Contract deployed to: ', await escrow.getAddress())
}

deployEscrow()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })