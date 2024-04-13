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
  
  const Dex = await hre.ethers.getContractFactory("Dex");
  // below is deployes to sepolia network, the address is PoolAddressesProvider in Aave docs
  const dex = await Dex.deploy();
  await dex.waitForDeployment();
  const contractAddress = await dex.getAddress()

  console.log("Dex deployed at: ", contractAddress);

  const envFilePath = '.env';
    const parsedEnv = dotenv.parse(fs.readFileSync(envFilePath));
    const envVariableName = 'CONTRACT_DEPLOYED_ADDRESS_DEX';
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
