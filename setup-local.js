const { ethers } = require("hardhat");

async function main() {
    // Get the first signer (account)
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Get the contract factory
    const BloodDonationSystem = await ethers.getContractFactory("BloodDonationSystem");
    
    // Deploy the contract
    const bloodDonationSystem = await BloodDonationSystem.deploy();
    await bloodDonationSystem.deployed();

    console.log("BloodDonationSystem deployed to:", bloodDonationSystem.address);

    // Register the deployer as an admin
    const ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE"));
    await bloodDonationSystem.grantRole(ADMIN_ROLE, deployer.address);
    console.log("Deployer granted ADMIN_ROLE");

    // Create .env file content
    const envContent = `REACT_APP_CONTRACT_ADDRESS=${bloodDonationSystem.address}
REACT_APP_NETWORK_ID=1337
REACT_APP_RPC_URL=http://127.0.0.1:8545`;

    console.log("\nAdd these environment variables to your frontend/.env file:");
    console.log(envContent);
    console.log("\nSetup complete! Make sure to:");
    console.log("1. Add the above environment variables to frontend/.env");
    console.log("2. Restart your frontend development server");
    console.log("3. In MetaMask, add the local network with:");
    console.log("   - Network Name: Localhost 8545");
    console.log("   - RPC URL: http://127.0.0.1:8545");
    console.log("   - Chain ID: 1337");
    console.log("   - Currency Symbol: ETH");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 