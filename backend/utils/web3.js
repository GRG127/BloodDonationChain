const { ethers } = require('ethers');
const BloodDonationSystem = require('../../frontend/src/artifacts/contracts/BloodDonationSystem.sol/BloodDonationSystem.json');

// Get contract address from environment or use default for development
const contractAddress = process.env.CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Connect to provider
const getProvider = () => {
  return new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
};

// Get contract instance
const getContract = () => {
  const provider = getProvider();
  return new ethers.Contract(contractAddress, BloodDonationSystem.abi, provider);
};

// Get contract with signer
const getContractWithSigner = (privateKey) => {
  const provider = getProvider();
  const wallet = new ethers.Wallet(privateKey, provider);
  return new ethers.Contract(contractAddress, BloodDonationSystem.abi, wallet);
};

module.exports = {
  getProvider,
  getContract,
  getContractWithSigner
}; 