const wethArtifact = require(`../externalABIs/WETH.json`);
const uniswapV3PoolArtifact = require('../externalABIs/UniswapV3Pool.json')
const camelotSwapRouterArtifact = require('../externalABIs/CamelotSwapRouter.json')
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
require("dotenv").config();

