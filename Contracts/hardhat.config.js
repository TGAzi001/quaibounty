/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require('@nomicfoundation/hardhat-toolbox')
require('@quai/quais-upgrades');
require("@quai/hardhat-deploy-metadata");

require("dotenv").config();
// dotenv.config({ path: '../.env' })

module.exports = {
  defaultNetwork: 'ochard',
  networks: {
    ochard: {
      url: process.env.QUAI_RPC_URL,
      accounts: [process.env.SIGNER],
      chainId: Number(process.env.CHAIN_ID),
    },
    cyprus1_fullpath: {
      url: "https://orchard.rpc.quai.network/cyprus1",
      accounts: [process.env.SIGNER],
      chainId: Number(process.env.CHAIN_ID),
    },
  },

  solidity: {
    compilers: [
      {
      version: '0.8.28',
      settings: {
        optimizer: {
          enabled: true,
          runs: 1000,
        },
        metadata: {
          bytecodeHash: 'ipfs',
          useLiteralContent: true, // Include the source code in the metadata
        },
        evmVersion: 'london',
      },
    },
    {
      version: '0.8.28',
      settings: {
        optimizer: {
          enabled: true,
          runs: 1000,
        },
        metadata: {
          bytecodeHash: 'ipfs',
          useLiteralContent: true, // Include the source code in the metadata
        },
        evmVersion: 'london',
      },
    },
  ]
  },

  // etherscan: {
  //   apiKey: {
  //     cyprus1: 'abc',
  //   },
  //   customChains: [
  //     {
  //       network: 'cyprus1',
  //       chainId: Number(process.env.CHAINID),
  //       urls: {
  //         apiURL: 'https://quaiscan.io/api/v2',
  //         browserURL: 'https://quaiscan.io/',
  //       },
  //     },
  //   ],
  // },

  paths: {
    sources: './contracts',
    cache: './cache',
    artifacts: './artifacts',
  },
  mocha: {
    timeout: 20000,
  },
}