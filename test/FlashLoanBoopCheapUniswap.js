const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const wethArtifact = require(`../externalABIs/WETH.json`);
const uniswapV3PoolArtifact = require('../externalABIs/UniswapV3Pool.json')
const camelotSwapRouterArtifact = require('../externalABIs/CamelotSwapRouter.json')
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

describe("FlashLoanBoopCheapUniswap", function () {
  it("Should deploy", async function(){
    owner = await ethers.getSigners();

    const FlashLoanBoopCheapUniswap = await ethers.getContractFactory("FlashLoanBoopCheapUniswap");
    const flashLoanBoopCheapUniswap = await FlashLoanBoopCheapUniswap.deploy('0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb');
    await flashLoanBoopCheapUniswap.waitForDeployment();
    const contractAddress = await flashLoanBoopCheapUniswap.getAddress()
    console.log(contractAddress)
    expect(contractAddress).not.equals(null)
  })
  // it("Should be able to get BOOP price in ETH", async function(){
  //   // Contracts are deployed using the first signer/account by default
  //   const owner = await ethers.getSigners();

  //   // connect to router
  //   const routerAddress = '0xc873fEcbd354f5A56E00E710B90EF4201db2448d'
  //   const camelotABI = camelotSwapRouterArtifact.abi
  //   const camelotSwapRouterContract = new ethers.Contract(
  //     routerAddress, 
  //     camelotABI, 
  //     owner[0]
  //   );

  //   // get amount out
  //   const amountOut = await camelotSwapRouterContract.getAmountsOut(
  //     '1000000000000000000',
  //     [
  //       '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  //       '0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3'
  //     ]
  //   )
  //   console.log(amountOut)

  //   expect(amountOut[1].toString()).not.equals(null)
  // })
  // it("Should be able to swap WETH to BOOP", async function(){
  //   // Contracts are deployed using the first signer/account by default
  //   const signer = await ethers.getSigners();
  //   const wethABI = wethArtifact.abi
  //   const wethAddress = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
  //   const wethContract = new ethers.Contract(
  //     wethAddress,
  //     wethABI,
  //     signer[0]
  //   )

  //   let wethBalance = await wethContract.balanceOf(signer[0])
  //   console.log("Signer WETH balance: " + wethBalance)
  //   // deposit 1 eth
  //   const input = ethers.parseEther('1')
  //   let tx = await wethContract.connect(signer[0]).deposit({ value: input })
  //   await tx.wait()

  //   // grab balance of WETH
  //   wethBalance = await wethContract.balanceOf(signer[0])
  //   console.log("Signer WETH Balance" + wethBalance)
    
  //   // deploy camelot swap contract
  //   const SampleCamelotSwap = await ethers.getContractFactory("SampleCamelotSwap");
  //   const sampleCamelotSwap = await SampleCamelotSwap.deploy();
  //   await sampleCamelotSwap.waitForDeployment();
  //   const contractAddress = await sampleCamelotSwap.getAddress()
  //   console.log("Swap Contract address: " + contractAddress)

  //   // send WETH to camelot swap contract
  //   let sendAmount = ethers.parseEther('1')
  //   tx = await wethContract.connect(signer[0]).transfer(contractAddress, sendAmount)
  //   await tx.wait()

  //   // check contract WETH balance
  //   let contractBalance = await wethContract.balanceOf(contractAddress)
  //   console.log('Swap Contract WETH Balance: ', contractBalance.toString())

  //   // params, calculate slippage
  //   const amountIn = ethers.parseEther('1').toString()
  //   console.log("amountIn: " + amountIn)
  //   // allow 5% slippage
  //   // connect to router
  //   const routerAddress = '0xc873fEcbd354f5A56E00E710B90EF4201db2448d'
  //   const camelotABI = camelotSwapRouterArtifact.abi
  //   const camelotSwapRouterContract = new ethers.Contract(
  //     routerAddress, 
  //     camelotABI, 
  //     owner[0]
  //   );

  //   // get amount out
  //   let amountOutMin = await camelotSwapRouterContract.getAmountsOut(
  //     amountIn,
  //     [
  //       '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  //       '0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3'
  //     ]
  //   )
  //   amountOutMin = (amountOutMin[1] * BigInt(95)) / BigInt(100)
  //   amountOutMin = amountOutMin.toString()
  //   console.log("amountOutMin: " + amountOutMin)
  //   // swap tokens
  //   tx = await sampleCamelotSwap.connect(signer[0]).swapExactInputSingle(
  //     amountIn,
  //     amountOutMin
  //   )
  //   await tx.wait()
    
  //   // find contract balance of Boop
  //   const boopABI = wethArtifact.abi
  //   const boopAddress = '0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3'
  //   boopContract = new ethers.Contract(
  //     boopAddress,
  //     boopABI,
  //     signer[0]
  //   )
  //   let boopBalance = await boopContract.balanceOf(contractAddress)
  //   console.log('Swap Contract Boop Balance: ', boopBalance.toString())


  //   expect(boopBalance).not.equals(0)
  // })
})
