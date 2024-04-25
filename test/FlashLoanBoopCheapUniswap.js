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
    const FlashLoanBoopCheapUniswap = await ethers.getContractFactory("FlashLoanBoopCheapUniswap");
    const flashLoanBoopCheapUniswap = await FlashLoanBoopCheapUniswap.deploy('0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb');
    await flashLoanBoopCheapUniswap.waitForDeployment();
    const contractAddress = await flashLoanBoopCheapUniswap.getAddress()
    console.log(contractAddress)
    expect(contractAddress).not.equals(null)
  })
  it("Should be able to get BOOP price in ETH Uniswap", async function(){
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
  it("Should be able to get BOOP price in ETH Camelot", async function(){
    // Contracts are deployed using the first signer/account by default
    const owner = await ethers.getSigners();

    // connect to router
    const routerAddress = '0xc873fEcbd354f5A56E00E710B90EF4201db2448d'
    const camelotABI = camelotSwapRouterArtifact.abi
    const camelotSwapRouterContract = new ethers.Contract(
      routerAddress, 
      camelotABI, 
      owner[0]
    );

    // get amount out
    const amountOut = await camelotSwapRouterContract.getAmountsOut(
      '1000000000000000000',
      [
        '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        '0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3'
      ]
    )
    console.log(amountOut)

    expect(amountOut[1].toString()).not.equals(null)
  })
  it("Should be able to perform BOOP cheap uniswap arbitrage operation", async function(){
    // at this point in the forked arbitrum blockchain, BOOP
    // is actually cheaper on Camelot.
    // In order to create conditions for the arbitrage to execute,
    // let's create a large buy order for BOOP on camelot
    const signer = await ethers.getSigners();
    const wethABI = wethArtifact.abi
    const wethAddress = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
    const wethContract = new ethers.Contract(
      wethAddress,
      wethABI,
      signer[0]
    )

    let wethBalance = await wethContract.balanceOf(signer[0])
    let wethBalanceOriginal = wethBalance
    console.log("Signer WETH balance: " + wethBalance)
    // deposit 1 eth
    const camelotInput = ethers.parseEther('100')
    let tx = await wethContract.connect(signer[0]).deposit({ value: camelotInput })
    await tx.wait()

    // grab balance of WETH
    wethBalance = await wethContract.balanceOf(signer[0])
    console.log("Signer WETH Balance: " + wethBalance)
    
    // deploy camelot swap contract
    const SampleCamelotSwap = await ethers.getContractFactory("SampleCamelotSwap");
    const sampleCamelotSwap = await SampleCamelotSwap.deploy();
    await sampleCamelotSwap.waitForDeployment();
    const camelotAddress = await sampleCamelotSwap.getAddress()
    console.log("Swap Contract address: " + camelotAddress)

    // send WETH to camelot swap contract
    let camelotSendAmount = ethers.parseEther('100')
    tx = await wethContract.connect(signer[0]).transfer(camelotAddress, camelotSendAmount)
    await tx.wait()

    // check contract WETH balance
    let camelotContractBalance = await wethContract.balanceOf(camelotAddress)
    console.log('Swap Contract WETH Balance: ', camelotContractBalance.toString())

    // params, calculate slippage
    const amountIn = ethers.parseEther('100').toString()
    console.log("Camelot initial BOOP Buy WETH amountIn: " + amountIn)
    // connect to router
    const camelotRouterAddress = '0xc873fEcbd354f5A56E00E710B90EF4201db2448d'
    const camelotABI = camelotSwapRouterArtifact.abi
    const camelotSwapRouterContract = new ethers.Contract(
      camelotRouterAddress, 
      camelotABI, 
      signer[0]
    );

    // get amount out
    let amountOutMin = await camelotSwapRouterContract.getAmountsOut(
      amountIn,
      [
        '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        '0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3'
      ]
    )
    amountOutMin = (amountOutMin[1] * BigInt(95)) / BigInt(100)
    amountOutMin = amountOutMin.toString()
    console.log("Camelot inital BOOP Buy amountOutMin: " + amountOutMin)
    // swap tokens
    tx = await sampleCamelotSwap.connect(signer[0]).swapExactInputSingle(
      amountIn,
      amountOutMin
    )
    await tx.wait()
    
    // find contract balance of Boop
    const boopABI = wethArtifact.abi
    const boopAddress = '0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3'
    boopContract = new ethers.Contract(
      boopAddress,
      boopABI,
      signer[0]
    )
    let boopBalance = await boopContract.balanceOf(camelotAddress)
    console.log('Swap Contract Boop Balance: ', boopBalance.toString())
    // end of inital BOOP buy

    // start actual arbitrage test
    // set up weth get starting balance of signer
    wethBalance = await wethContract.balanceOf(signer[0])
    console.log("Signer WETH balance: " + wethBalance)
    // deposit 1 eth
    const input = ethers.parseEther('1')
    tx = await wethContract.connect(signer[0]).deposit({ value: input })
    await tx.wait()

    // deploy arbitrage contract
    const FlashLoanBoopCheapUniswap = await ethers.getContractFactory("FlashLoanBoopCheapUniswap");
    const flashLoanBoopCheapUniswap = await FlashLoanBoopCheapUniswap.deploy('0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb');
    await flashLoanBoopCheapUniswap.waitForDeployment();
    const contractAddress = await flashLoanBoopCheapUniswap.getAddress()
    console.log("Boop Cheap Uniswap Arbitrage Contract address: " + contractAddress)

    // get uniswap inputs

    // send WETH to uniswap contract
    let sendAmount = ethers.parseEther('0.0001')
    tx = await wethContract.connect(signer[0]).transfer(contractAddress, sendAmount)
    await tx.wait()

    // check contract WETH balance
    let contractBalance = await wethContract.balanceOf(contractAddress)
    console.log('Swap Contract WETH Balance: ', contractBalance.toString())

    // get price of boop to calculate minOut
    const boopWETHPoolAddress = '0xe24F62341D84D11078188d83cA3be118193D6389'
    const uniswapV3PoolABI = uniswapV3PoolArtifact.abi
    const boopWETHPool = new ethers.Contract(
      boopWETHPoolAddress, 
      uniswapV3PoolABI, 
      signer[0]
    );
    const slot0 = await boopWETHPool.slot0()
    // price of boop in eth
    const sqrtPriceX96 = slot0.sqrtPriceX96.toString()
    console.log("sqrtPriceX96: " + sqrtPriceX96)
    const uniswapBoopPrice = (sqrtPriceX96 ** 2) / (2 ** 192);
    console.log("Uniswap Boop Price: " + uniswapBoopPrice)
    // params, calculate slippage
    const uniswapAmountIn = ethers.parseEther('1').toString()
    console.log("Uniswap WETH amountIn: " + uniswapAmountIn)
    // allow 5% slippage
    const uniswapAmountOutMin = BigInt(((1 / uniswapBoopPrice) * 0.95) * 10**18)
    console.log("Uniswap BOOP amountOutMin: " + uniswapAmountOutMin)



    // get camelot constants

    // params, calculate slippage
    const camelotAmountIn = uniswapAmountOutMin
    console.log("Camelot min amountIn: " + camelotAmountIn)
    // allow 5% slippage
    // get amount out
    let camelotAmountOutMin = await camelotSwapRouterContract.getAmountsOut(
      camelotAmountIn,
      [
        '0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3',
        '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
      ]
    )
    camelotAmountOutMin = (camelotAmountOutMin[1] * BigInt(95)) / BigInt(100)
    camelotAmountOutMin = camelotAmountOutMin.toString()
    console.log("Camelot WETH amountOutMin: " + camelotAmountOutMin)
    const camelotBoopPrice = camelotAmountOutMin.toString() / camelotAmountIn.toString()
    console.log("Boop effective price Camelot: " + camelotBoopPrice)

    // perform arbitrage operation
    tx = await flashLoanBoopCheapUniswap.requestFlashLoan(
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', 
      uniswapAmountIn.toString(), 
      uniswapAmountOutMin.toString(),
      ((BigInt(sqrtPriceX96)*BigInt(105))/BigInt(100)).toString(),
      camelotAmountOutMin.toString()
    )

    await tx.wait()
    console.log(tx)
    contractBalance = await wethContract.balanceOf(contractAddress)
    contractBalance = contractBalance / BigInt(10**18)
    console.log('Swap Contract WETH Balance After Arbitrage: ', contractBalance.toString())
    expect(contractBalance).to.be.greaterThan(wethBalanceOriginal)
  })
})
