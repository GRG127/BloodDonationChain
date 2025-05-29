const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const BloodDonationSystem = await hre.ethers.getContractFactory("BloodDonationSystem");
  
  // Deploy the contract
  const bloodDonationSystem = await BloodDonationSystem.deploy();
  await bloodDonationSystem.deployed();

  console.log("BloodDonationSystem deployed to:", bloodDonationSystem.address);
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 