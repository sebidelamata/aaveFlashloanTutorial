// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
require('dotenv').config();

async function main() {
  
  const FlashLoan = await hre.ethers.getContractFactory("FlashLoanSampleArbitrage");
  // below is deployes to sepolia network, the address is PoolAddressesProvider in Aave docs
  const flashLoan = await FlashLoan.deploy('0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A');
  await flashLoan.waitForDeployment();
  const contractAddress = await flashLoan.getAddress()

  console.log("Flashloan deployed at: ", contractAddress);

  const envFilePath = '.env';
  const parsedEnv = dotenv.parse(fs.readFileSync(envFilePath));
  const envVariableName = 'CONTRACT_DEPLOYED_ADDRESS_FLASHLOAN_SAMPLE_ARBITRAGE';
  if (envVariableName in parsedEnv) {
      delete parsedEnv[envVariableName];
  }
  parsedEnv[envVariableName] = contractAddress;
  const updatedEnvContent = Object.entries(parsedEnv)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
  fs.writeFileSync(envFilePath, updatedEnvContent);

  console.log('Contract address written to .env file successfully.');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
