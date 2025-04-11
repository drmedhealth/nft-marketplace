require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  // Get contract factory
  const NFTMarket = await ethers.getContractFactory("NFTMarket");

  // Deploy the contract
  const nftMarket = await NFTMarket.deploy();

  // Show the deployed address
  console.log("✅ NFTMarket deployed to:", nftMarket.target);
}

// Run the main function
main().catch((error) => {
  console.error("❌ Deployment error:", error);
  process.exitCode = 1;
});
