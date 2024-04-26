require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.10",
  networks: {
    sepolia: {
      url: process.env.INFURA_SEPOLIA_ENDPOINT,
      accounts: [process.env.DEV_BURNER_ACCOUNT0_PRIVATE_KEY],
    },
    hardhat: {
      forking: {
        url: process.env.INFURA_ARBITRUM_ENDPOINT,
        blockNumber: 202653650,
        enabled: true,
        
      },
      chainId: 42161, // Arbitrum One chain ID,
    },
    arbitrum: {
      url: process.env.INFURA_ARBITRUM_ENDPOINT,
      accounts: [process.env.DEV_BURNER_ACCOUNT0_PRIVATE_KEY],
      chainId: 42161, // Arbitrum One chain ID
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
    }
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true
  }
};
