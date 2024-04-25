const {
  time,
  loadFixture,
  reset
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const wethArtifact = require(`../externalABIs/WETH.json`);
const uniswapV3PoolArtifact = require('../externalABIs/UniswapV3Pool.json')
const camelotSwapRouterArtifact = require('../externalABIs/CamelotSwapRouter.json')
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
require("dotenv").config();

describe("FlashLoanBoopCheapCamelot", function () {
 
  it("Should deploy", async function(){
    const FlashLoanBoopCheapUniswap = await ethers.getContractFactory("FlashLoanBoopCheapCamelot");
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
      owner[1]
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
      owner[1]
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
  it("Should be able to perform BOOP cheap camelot arbitrage operation", async function(){
    
    // at this point in the forked arbitrum blockchain, BOOP
    // is a little cheaper on Camelot.
    // In order to create extreme conditions for the arbitrage test to execute,
    // let's create a large buy order for BOOP on uniswap

    // first lets get weth balance currently
    const signer = await ethers.getSigners();
    const wethABI = wethArtifact.abi
    const wethAddress = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
    const wethContract = new ethers.Contract(
      wethAddress,
      wethABI,
      signer[1]
    )
    // we get the signers  weth balance
    let wethBalance = await wethContract.balanceOf(signer[1])
    console.log("Signer WETH balance: " + wethBalance)
    // deposit 100 (or just a large amount) eth
    const preArbitrageBuyAmount = ethers.parseEther('100')
    // wait for it to convert so now we should have 100 WETH
    let tx = await wethContract.connect(signer[1]).deposit({ value: preArbitrageBuyAmount })
    await tx.wait()

    // grab balance of WETH
    wethBalance = await wethContract.balanceOf(signer[1])
    console.log("Signer WETH Balance: " + wethBalance)
    
    // deploy uniswap swap contract to make a boop buy order
    const SampleUniswapTokenSwap = await ethers.getContractFactory("SampleUniswapTokenSwap");
    const sampleUniswapTokenSwap = await SampleUniswapTokenSwap.deploy();
    await sampleUniswapTokenSwap.waitForDeployment();
    const uniswapAddress = await sampleUniswapTokenSwap.getAddress()
    console.log("Uniswap swap Contract address for large BOOP buy (pre-arbitrage): " + uniswapAddress)

    // send WETH to uniswap swap contract
    tx = await wethContract.connect(signer[1]).transfer(uniswapAddress, preArbitrageBuyAmount)
    await tx.wait()

    // check contract WETH balance on the uniswap contract
    let uniswapContractBalance = await wethContract.balanceOf(uniswapAddress)
    console.log('Uniswap pre-arbitrage Contract WETH Balance: ', uniswapContractBalance.toString())

    // get price of boop to calculate minOut
    const boopWETHPoolAddress = '0xe24F62341D84D11078188d83cA3be118193D6389'
    const uniswapV3PoolABI = uniswapV3PoolArtifact.abi
    const boopWETHPool = new ethers.Contract(
      boopWETHPoolAddress, 
      uniswapV3PoolABI, 
      signer[1]
    );
    let slot0 = await boopWETHPool.slot0()
    let sqrtPriceX96 = slot0.sqrtPriceX96.toString()
    console.log("sqrtPriceX96: " + sqrtPriceX96)
    let boopPrice = ((sqrtPriceX96 ** 2) / (2 ** 192))
    console.log("uniswap boop price in eth:" + boopPrice)
    // allow 5% slippage
    const amountOutMin = BigInt(0)
    console.log("amountOutMin: " + amountOutMin)
    // doing 105% (5% slippage)
    let limitPrice = ((BigInt(sqrtPriceX96)*BigInt(105))/BigInt(100)).toString()
    console.log("limit price: " + limitPrice)
    tx = await sampleUniswapTokenSwap.connect(signer[1]).swapExactInputSingle(
      preArbitrageBuyAmount.toString(),
      amountOutMin.toString(),
      limitPrice
    )
    await tx.wait()
    
    // find contract balance of Boop
    // using weth artifact bc it is also erc20
    const boopABI = wethArtifact.abi
    const boopAddress = '0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3'
    const boopContract = new ethers.Contract(
      boopAddress,
      boopABI,
      signer[1]
    )
    let boopBalance = await boopContract.balanceOf(uniswapAddress)
    console.log('Swap Contract Boop Balance post pre-arbitrage trade: ', boopBalance.toString())
    console.log("End of initial BOOP BUY ARBITRAGE STARTS HERE")
    // end of inital BOOP buy
    ////////////////////////
    ////////////////////

    ////////////////////////////////
    // start actual arbitrage test
    ////////////////////////////////
    
    // set up weth get starting balance of signer
    wethBalance = await wethContract.balanceOf(signer[0])
    let wethBalanceOriginal = wethBalance.toString()
    console.log("Signer WETH balance: " + wethBalance)
    // deposit 1 eth
    const flashloanDeposit = ethers.parseEther('1')
    tx = await wethContract.connect(signer[0]).deposit({ value: flashloanDeposit })
    await tx.wait()
    console.log('Signer WETH Balance: ' + await wethContract.balanceOf(signer[0]))

    // deploy arbitrage contract
    const FlashLoanBoopCheapCamelot = await ethers.getContractFactory("FlashLoanBoopCheapCamelot");
    const flashLoanBoopCheapCamelot = await FlashLoanBoopCheapCamelot.deploy('0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb');
    await flashLoanBoopCheapCamelot.waitForDeployment();
    const camelotContractAddress = await flashLoanBoopCheapCamelot.getAddress()
    console.log("Boop Cheap Camelot Arbitrage Contract address: " + camelotContractAddress)
    // get uniswap inputs
    flashLoanBoopCheapCamelot.on("Balances", (wethBalance, boopBalance) => {
      console.log("Balances event emitted:");
      console.log("WETH Balance: ", wethBalance.toString());
      console.log("BOOP Balance: ", boopBalance.toString());
  });

    // send WETH to camelot contract
    tx = await wethContract.connect(signer[0]).transfer(camelotContractAddress, flashloanDeposit)
    await tx.wait()

    // check contract WETH balance
    const camelotAmountIn = await wethContract.balanceOf(camelotContractAddress)
    console.log('Boop Cheap Camelot Arbitrage WETH Balance: ', camelotAmountIn.toString())

    //////// need to input 1 into camelot find out then input that into uniswap

    // get camelot constants
    // connect to router
    const camelotRouterAddress = '0xc873fEcbd354f5A56E00E710B90EF4201db2448d'
    const camelotABI = camelotSwapRouterArtifact.abi
    const camelotSwapRouterContract = new ethers.Contract(
      camelotRouterAddress, 
      camelotABI, 
      signer[0]
    );

    // params, calculate slippage
    console.log("Camelot WETH amountIn: " + camelotAmountIn)
    // allow 5% slippage
    // get amount out
    let camelotAmountOutMin = await camelotSwapRouterContract.getAmountsOut(
      camelotAmountIn,
      [
        '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        '0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3'
      ]
    )
    console.log("Camelot inital BOOP amount out quote: " + camelotAmountOutMin)
    camelotAmountOutMin = (camelotAmountOutMin[1] * BigInt(95)) / BigInt(100)
    camelotAmountOutMin = camelotAmountOutMin.toString()
    console.log("Camelot Boop amountOutMin: " + camelotAmountOutMin)

    // get uniswap quotes
    slot0 = await boopWETHPool.slot0()
    sqrtPriceX96 = slot0.sqrtPriceX96.toString()
    console.log("sqrtPriceX96: " + sqrtPriceX96)
    const uniswapBoopPrice = (sqrtPriceX96 ** 2) / (2 ** 192);
    console.log("Uniswap Boop Price in WETH: 1 WETH = " + uniswapBoopPrice + " BOOP")
    // params, calculate slippage
    const uniswapAmountIn = camelotAmountOutMin.toString()
    console.log("Uniswap Boop amountIn: " + uniswapAmountIn)
    // allow 5% slippage
    const uniswapAmountOutMin = Math.round(uniswapAmountIn * 0.95 * uniswapBoopPrice)
    console.log("Uniswap WETH amountOutMin: " + uniswapAmountOutMin)
    console.log(await wethContract.balanceOf(camelotContractAddress))

    // perform arbitrage operation
    tx = await flashLoanBoopCheapCamelot.requestFlashLoan(
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', 
      camelotAmountIn.toString(), 
      uniswapAmountOutMin.toString(),
      0,
      camelotAmountOutMin.toString()
    )

    await tx.wait()
    console.log(tx)
    let postArbitrageContractBalance = await wethContract.balanceOf(camelotContractAddress)
    let postArbitrageContractBalanceNoDecimal = postArbitrageContractBalance / BigInt(10**18)
    console.log('Swap Contract WETH Balance After Arbitrage: ', postArbitrageContractBalanceNoDecimal.toString())
    expect(postArbitrageContractBalance).to.be.greaterThan(wethBalanceOriginal.toString())
  })
})
