const wethArtifact = require(`../externalABIs/WETH.json`);
const uniswapV3PoolArtifact = require('../externalABIs/UniswapV3Pool.json')
const camelotSwapRouterArtifact = require('../externalABIs/CamelotSwapRouter.json')
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
require("dotenv").config();

const findCamelotBoopPrice = async (amountInCamelot) => {
    const signer = await ethers.getSigners();

    // connect to router
    const camelotRouterAddress = '0xc873fEcbd354f5A56E00E710B90EF4201db2448d'
    const camelotABI = camelotSwapRouterArtifact.abi
    const camelotSwapRouterContract = new ethers.Contract(
        camelotRouterAddress, 
        camelotABI, 
        signer[0]
    );

    // get amount out
    const amountOutCamelot = await camelotSwapRouterContract.getAmountsOut(
        amountInCamelot,
      [
        '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        '0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3'
      ]
    )

    const boopPrice = amountInCamelot / amountOutCamelot

    console.log(boopPrice)
}

const main = async () => {
    await findCamelotBoopPrice('1000000000000000000')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });