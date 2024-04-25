const hre = require("hardhat")
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
require('dotenv').config();

async function main() {
    console.log('...deploying Boop Cheap Uniswap contract')
    const FlashLoanBoopCheapUniswap = await hre.ethers.getContractFactory("FlashLoanBoopCheapUniswap");
    const flashLoanBoopCheapUniswap = await FlashLoanBoopCheapUniswap.deploy('0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb');
    await flashLoanBoopCheapUniswap.waitForDeployment();
    let uniswapContractAddress = await flashLoanBoopCheapUniswap.getAddress()
    console.log('FlashLoanBoopCheapUniswap deployed at ' + uniswapContractAddress)

    console.log('...deploying Boop Cheap Uniswap contract')
    const FlashLoanBoopCheapCamelot = await hre.ethers.getContractFactory("FlashLoanBoopCheapCamelot");
    const flashLoanBoopCheapCamelot = await FlashLoanBoopCheapCamelot.deploy('0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb');
    await flashLoanBoopCheapCamelot.waitForDeployment();
    let camelotContractAddress = await flashLoanBoopCheapCamelot.getAddress()
    console.log('FlashLoanBoopCheapCamelot deployed at ' + camelotContractAddress)

    const envFilePath = '.env';
    let parsedEnv = dotenv.parse(fs.readFileSync(envFilePath));
    let envVariableNameUniswap = 'CONTRACT_DEPLOYED_ADDRESS_BOOP_CHEAP_UNISWAP';
    let envVariableNameCamelot = 'CONTRACT_DEPLOYED_ADDRESS_BOOP_CHEAP_CAMELOT';

    if (envVariableNameUniswap in parsedEnv) {
        delete parsedEnv[envVariableNameUniswap];
    }
    parsedEnv[envVariableNameUniswap] = uniswapContractAddress;

    if (envVariableNameCamelot in parsedEnv) {
        delete parsedEnv[envVariableNameCamelot];
    }
    parsedEnv[envVariableNameCamelot] = camelotContractAddress;

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