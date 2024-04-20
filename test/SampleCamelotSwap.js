const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const wethArtifact = require(`../externalABIs/WETH.json`);
const uniswapV3PoolArtifact = require('../externalABIs/UniswapV3Pool.json')
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

describe("SampleCamelotSwap", function () {
  it("Should deploy", async function(){
    owner = await ethers.getSigners();

    const SampleCamelotSwap = await ethers.getContractFactory("SampleCamelotSwap");
    const sampleCamelotSwap = await SampleCamelotSwap.deploy();
    await sampleCamelotSwap.waitForDeployment();
    const contractAddress = await sampleCamelotSwap.getAddress()
    console.log(contractAddress)
    expect(contractAddress).not.equals(null)
  })
  // it("Should be able to get BOOP price in ETH", async function(){
  //   // Contracts are deployed using the first signer/account by default
  //   const owner = await ethers.getSigners();

  //   const boopWETHPoolAddress = '0xe24F62341D84D11078188d83cA3be118193D6389'
  //   const uniswapV3PoolABI = uniswapV3PoolArtifact.abi
  //   const boopWETHPool = new ethers.Contract(
  //     boopWETHPoolAddress, 
  //     uniswapV3PoolABI, 
  //     owner[0]
  //   );

  //   // get slot0
  //   const slot0 = await boopWETHPool.slot0()
  //   const sqrtPriceX96 = slot0.sqrtPriceX96.toString()
  //   console.log(sqrtPriceX96.toString())
  //   const boopPrice = ((sqrtPriceX96 / 2**96)**2) / (10**18 / 10**18).toFixed(18);
  //   console.log(boopPrice)

  //   expect(boopPrice).not.equals(null)
  // })
  // it("Should be able to swap WETH to BOOP", async function(){
  //   // Contracts are deployed using the first signer/account by default
  //   const signer = await ethers.getSigners();
  //   const wethABI = wethArtifact.abi
  //   const wethAddress = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
  //   wethContract = new ethers.Contract(
  //     wethAddress,
  //     wethABI,
  //     signer[0]
  //   )

  //   let wethBalance = await wethContract.balanceOf(signer[0])
  //   console.log("Signer WETH balance: " + wethBalance)
    
  //   // deploy uniswap contract
  //   const SampleUniswapTokenSwap = await ethers.getContractFactory("SampleUniswapTokenSwap");
  //   const sampleUniswapTokenSwap = await SampleUniswapTokenSwap.deploy();
  //   await sampleUniswapTokenSwap.waitForDeployment();
  //   const contractAddress = await sampleUniswapTokenSwap.getAddress()
  //   console.log("Swap Contract address: " + contractAddress)

  //   // send WETH to uniswap contract
  //   let sendAmount = ethers.parseEther('1')
  //   let tx = await wethContract.connect(signer[0]).transfer(contractAddress, sendAmount)
  //   await tx.wait()

  //   // check contract WETH balance
  //   let contractBalance = await wethContract.balanceOf(contractAddress)
  //   console.log('Swap Contract WETH Balance: ', contractBalance.toString())

  //   // get price of boop to calculate minOut
  //   const boopWETHPoolAddress = '0xe24F62341D84D11078188d83cA3be118193D6389'
  //   const uniswapV3PoolABI = uniswapV3PoolArtifact.abi
  //   const boopWETHPool = new ethers.Contract(
  //     boopWETHPoolAddress, 
  //     uniswapV3PoolABI, 
  //     owner[0]
  //   );
  //   const slot0 = await boopWETHPool.slot0()
  //   const sqrtPriceX96 = slot0.sqrtPriceX96.toString()
  //   console.log("sqrtPriceX96: " + sqrtPriceX96)
  //   const boopPrice = ((sqrtPriceX96 / 2**96)**2) / (10**18 / 10**18).toFixed(18);
  //   console.log(boopPrice)

  //   // params, calculate slippage
  //   const amountIn = ethers.parseEther('1').toString()
  //   console.log("amountIn: " + amountIn)
  //   // allow 5% slippage
  //   const amountOutMin = BigInt(((1 / boopPrice) * 0.95) * 10**18)
  //   console.log("amountOutMin: " + amountOutMin)
  //   console.log(((BigInt(sqrtPriceX96)*BigInt(105))/BigInt(100)).toString())
  //   // swap tokens
  //   tx = await sampleUniswapTokenSwap.connect(signer[0]).swapExactInputSingle(
  //     amountIn.toString(),
  //     amountOutMin.toString(),
  //     ((BigInt(sqrtPriceX96)*BigInt(105))/BigInt(100)).toString()
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
