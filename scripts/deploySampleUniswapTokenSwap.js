const hre = require("hardhat")
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
require('dotenv').config();

async function main() {
    console.log('...deploying')
    const SingleSwap = await hre.ethers.getContractFactory("SampleUniswapTokenSwap")
    const singleSwap = await SingleSwap.deploy()
    await singleSwap.waitForDeployment()
    const contractAddress = await singleSwap.getAddress()
    console.log('SampleUniswapTokenSwap deployed at ' + contractAddress)

    const envFilePath = '.env';
    const parsedEnv = dotenv.parse(fs.readFileSync(envFilePath));
    const envVariableName = 'CONTRACT_DEPLOYED_ADDRESS_SAMPLE_UNISWAP_TOKEN_SWAP';
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

main().catch((err) => {
    console.log(err)
    process.exitCode = 1
})