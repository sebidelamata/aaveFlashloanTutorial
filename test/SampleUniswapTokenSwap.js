const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const wethArtifact = require(`../externalABIs/WETH.json`);
const uniswapV3PoolArtifact = require('../externalABIs/UniswapV3Pool.json')
const { ethers } = require("hardhat");

describe("SampleUniswapTokenSwap", function () {
  it("Should deploy", async function(){
    owner = await ethers.getSigners();

    const SampleUniswapTokenSwap = await ethers.getContractFactory("SampleUniswapTokenSwap");
    const sampleUniswapTokenSwap = await SampleUniswapTokenSwap.deploy();
    await sampleUniswapTokenSwap.waitForDeployment();
    const contractAddress = await sampleUniswapTokenSwap.getAddress()
    console.log(contractAddress)
    expect(contractAddress).not.equals(null)
  })
  it("Should be able to turn ETH to WETH", async function(){
    // Contracts are deployed using the first signer/account by default
    const signer = await ethers.getSigners();
    const wethABI = wethArtifact.abi
    const wethAddress = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
    wethContract = new ethers.Contract(
      wethAddress,
      wethABI,
      signer[0]
    )

    let wethBalance = await wethContract.balanceOf(signer[0])
    console.log(wethBalance)
    // deposit 1 eth
    const input = ethers.parseEther('1')
    let tx = await wethContract.connect(signer[0]).deposit({ value: input })
    await tx.wait()

    // grab balance of WETH
    wethBalance = await wethContract.balanceOf(signer[0])
    console.log(wethBalance)

    expect(wethBalance).to.equal(ethers.parseEther('1'))
  })
  it("Should be able to get BOOP price in ETH", async function(){
    // Contracts are deployed using the first signer/account by default
    const owner = await ethers.getSigners();

    const boopWETHPoolAddress = '0xe24F62341D84D11078188d83cA3be118193D6389'
    const uniswapV3PoolABI = uniswapV3PoolArtifact.abi
    const boopWETHPool = new ethers.Contract(
      boopWETHPoolAddress, 
      uniswapV3PoolABI, 
      owner[0]
    );

    // get slot0
    const slot0 = await boopWETHPool.slot0()
    const sqrtPriceX96 = slot0.sqrtPriceX96.toString()
    console.log(sqrtPriceX96.toString())
    const boopPrice = ((sqrtPriceX96 / 2**96)**2) / (10**18 / 10**18).toFixed(18);
    console.log(boopPrice)

    expect(boopPrice).not.equals(null)
  })
  // it("Should be able to swap WETH to BOOP", async function(){
  //   // Contracts are deployed using the first signer/account by default
  //   const owner = await ethers.getSigners();
  //   const wethABI = wethArtifact.abi
  //   const wethAddress = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
  //   wethContract = new ethers.Contract(
  //     wethAddress,
  //     wethABI,
  //     signer[0]
  //   )

  //   let wethBalance = await wethContract.balanceOf(signer[0])
  //   console.log("WETH balance: " + wethBalance)
    
  //   const SampleUniswapTokenSwap = await ethers.getContractFactory("SampleUniswapTokenSwap");
  //   const sampleUniswapTokenSwap = await SampleUniswapTokenSwap.deploy();
  //   await sampleUniswapTokenSwap.waitForDeployment();
  //   const contractAddress = await sampleUniswapTokenSwap.getAddress()
  //   console.log("Swap Contract address: " + contractAddress)

    

  //   expect(wethBalance).to.equal(ethers.parseEther('1'))
  // })
})
