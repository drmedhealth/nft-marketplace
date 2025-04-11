require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    }
  }
};

