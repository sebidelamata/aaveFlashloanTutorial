const wethArtifact = require(`../externalABIs/WETH.json`);
const uniswapV3PoolArtifact = require('../externalABIs/UniswapV3Pool.json')
const camelotSwapRouterArtifact = require('../externalABIs/CamelotSwapRouter.json')
const { ethers } = require("ethers");
require("dotenv").config();

const findCamelotBoopPrice = async (amountInCamelot) => {
    // setup wallet
    const provider = new ethers.JsonRpcProvider(process.env.INFURA_ARBITRUM_ENDPOINT)
    const signer = new ethers.Wallet(process.env.DEV_BURNER_ACCOUNT0_PRIVATE_KEY, provider)
    // connect to router
    const camelotRouterAddress = '0xc873fEcbd354f5A56E00E710B90EF4201db2448d'
    const camelotABI = camelotSwapRouterArtifact.abi
    const camelotSwapRouterContract = new ethers.Contract(
        camelotRouterAddress, 
        camelotABI, 
        signer
    );
    // get amount out
    const amountOutCamelot = await camelotSwapRouterContract.connect(signer).getAmountsOut(
        amountInCamelot,
      [
        '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        '0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3'
      ]
    )
    const boopPrice = amountInCamelot.toString() / amountOutCamelot[1].toString()
    return boopPrice.toString()
}

const findUniswapBoopPrice = async () => {
    // setup wallet
    const provider = new ethers.JsonRpcProvider(process.env.INFURA_ARBITRUM_ENDPOINT)
    const signer = new ethers.Wallet(process.env.DEV_BURNER_ACCOUNT0_PRIVATE_KEY, provider)

    const boopWETHPoolAddress = '0xe24F62341D84D11078188d83cA3be118193D6389'
    const uniswapV3PoolABI = uniswapV3PoolArtifact.abi
    const boopWETHPool = new ethers.Contract(
      boopWETHPoolAddress, 
      uniswapV3PoolABI, 
      signer
    );
    // get slot0
    const slot0 = await boopWETHPool.slot0()
    const sqrtPriceX96 = slot0.sqrtPriceX96.toString()
    const boopPrice = ((sqrtPriceX96 / 2**96)**2) / (10**18 / 10**18).toFixed(18);
    return boopPrice.toString()
}

const monitorPrices = async (amountInCamelot) => {
    const camelotPrice = await findCamelotBoopPrice(amountInCamelot)
    const uniswapPrice = await findUniswapBoopPrice()
    //test
    if(camelotPrice.toString() > uniswapPrice.toString()){
        console.log('uniswap')
    }
    if(camelotPrice.toString() < uniswapPrice.toString()){
        console.log('camelot')
    }
}

const main = async () => {
    await monitorPrices('1000000000000000000')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });