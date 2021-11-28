require('dotenv').config();

const mnemonic = process.env["MNEMONIC"];
const infuraKey = process.env["INFURA_KEY"];
const mainnetMnemonic = process.env["MAINNET_MNEMONIC"];

const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  contracts_build_directory: './build/arbitrum-contracts',
  contracts_directory: './contracts/arbitrum',
  migrations_directory: './migrations_arbitrum/',
  networks: {
    development: {
      url: "http://127.0.0.1:9545",
      network_id: "*",
    },
    arbitrum_local: {
      network_id: "*",
      gas: 8500000,
      provider: function() {
        return new HDWalletProvider({
          mnemonic: {
            phrase: mnemonic
          },
          providerOrUrl: "http://127.0.0.1:8547/",
          addressIndex: 0,
          numberOfAddresses: 1
        })
      }
    },
    arbitrum_testnet: {
      network_id: 421611,
      gas: 57561613, 
      gasPrice: 20000000000,
      provider: function() {
        return new HDWalletProvider({
          mnemonic: {
            phrase: mnemonic
          },
          providerOrUrl: `https://arbitrum-rinkeby.infura.io/v3/${infuraKey}`,
          addressIndex: 0,
          numberOfAddresses: 1,
          network_id: 421611,
          chainId: 421611
        })
      }
    }, 
    arbitrum_mainnet: {
      network_id: 42161,
      chain_id: 42161,
      provider: function() {
        return new HDWalletProvider(mainnetMnemonic, `https://arbitrum-mainnet.infura.io/v3/${infuraKey}`, 0, 1);
      }
    },
  },
  mocha: {
    timeout: 100000
  },
  compilers: {
    solc: {
      version: "^0.8.3",
      settings:  {
        optimizer: {
          enabled: true,
          runs: 800
        }
      }
    },
  },
  db: {
    enabled: false
  }
};
