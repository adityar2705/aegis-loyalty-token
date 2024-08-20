require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks:{
    sepolia:{
      accounts:[process.env.PRIVATE_KEY],
      url:process.env.SEPOLIA_URL,
    }
  },
  etherscan:{
    apiKey:process.env.ETHERSCAN_KEY
  }
};
