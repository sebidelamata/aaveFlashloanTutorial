const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const wethArtifact = require(`../externalABIs/WETH.json`);
const { ethers } = require("hardhat");

describe("SampleUniswapTokenSwap", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  it("Should deploy", async function(){
    // Contracts are deployed using the first signer/account by default
    owner = await ethers.getSigners();

    const SampleUniswapTokenSwap = await ethers.getContractFactory("SampleUniswapTokenSwap");
    // below is deployes to sepolia network, the address is PoolAddressesProvider in Aave docs
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
})
