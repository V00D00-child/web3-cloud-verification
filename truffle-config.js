require('dotenv').config();

const mnemonic = process.env["MNEMONIC"].trim();
const infuraKey = process.env["INFURA_KEY"].trim();
const mainnetMnemonic = process.env["MAINNET_MNEMONIC"].trim();

const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  contracts_build_directory: './build/ethereum-contracts',
  contracts_directory: './contracts/ethereum',
  migrations_directory: './migrations_ethereum/',
  networks: {
    development: {
      host: "127.0.0.1",  
      port: 7545,           
      network_id: "*",       
    },
    kovan: {
      network_id: 42,
      gas: 5000000,
      gasPrice: 25000000000,
      provider: function() {
        return new HDWalletProvider({
          mnemonic: {
            phrase: mnemonic
          },
          providerOrUrl: `https://kovan.infura.io/v3/${infuraKey}`,
          numberOfAddresses: 1,
          network_id: 42,
          chainId: 42
        })
      }
    },
    rinkeby: {
      gas: 5000000,
      gasPrice: 5000000000, // 5 gwei
      network_id: 4,
      skipDryRun: true,
      provider: function() {
        return new HDWalletProvider({
          mnemonic: {
            phrase: mnemonic
          },
          providerOrUrl: `https://rinkeby.infura.io/v3/${infuraKey}`,
          numberOfAddresses: 1,
          network_id: 4,
          chainId: 4
        })
      }
    },
    ropsten: {
      gas: 5000000,
      gasPrice: 5000000000, // 5 gwei
      network_id: 3,
      skipDryRun: true,
      provider: function() {
        return new HDWalletProvider({
          mnemonic: {
            phrase: mnemonic
          },
          providerOrUrl: `https://ropsten.infura.io/v3/${infuraKey}`,
          numberOfAddresses: 1,
          network_id: 3,
          chainId: 3
        })
      }
    },
    polygon_mumbai_test: {
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      provider: function() {
        return new HDWalletProvider({
          mnemonic: {
            phrase: mnemonic
          }, 
          providerOrUrl: `https://polygon-mumbai.infura.io/v3/${infuraKey}`,
          numberOfAddresses: 1,
          network_id: 80001,
          chainId: 80001
        })
      }
    },
    polygon_main: {
      provider: () => new HDWalletProvider(mainnetMnemonic, `https://polygon-rpc.com/`),
      network_id: 137,
      chainId: 137,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    main: {
      gas: 5000000,
      gasPrice: 5000000000, // 5 gwei
      network_id: 1,
      provider: function() {
        return new HDWalletProvider({
          mnemonic: {
            phrase: mainnetMnemonic
          },
          providerOrUrl: `https://main.infura.io/v3/${infuraKey}`,
          numberOfAddresses: 1,
          network_id: 1,
          chainId: 1
        })
      }
    },
  },
  mocha: {
    timeout: 100000
  },
  compilers: {
    solc: {
      version: "^0.8.3",
      settings: {
       optimizer: {
         enabled: false,
         runs: 200
       },
      }
    }
  },
  db: {
    enabled: false
  }
};
