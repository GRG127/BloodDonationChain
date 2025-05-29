require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainId: 1337
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/1d4e8a8501c54112a9ff45ea98604e0a",
      accounts: ["f48a757024e8428b11e9abbab3ddb0bc602773f5f12fa1d4dbbb3ba6a3674760"]
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  paths: {
    artifacts: "./frontend/src/artifacts",
  }
}; 