// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;
pragma abicoder v2;

import {SafeMath} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/SafeMath.sol";

// uniswap
interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        //uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    struct ExactOutputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        //uint256 deadline;
        uint256 amountOut;
        uint256 amountInMaximum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);

    function exactOutputSingle(ExactOutputSingleParams calldata params) external payable returns (uint256 amountIn);
}

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);
}

contract SampleUniswapTokenSwap {
    address public constant routerAddress = 0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E;
    ISwapRouter public immutable swapRouter = ISwapRouter(routerAddress);

    address public constant LINK = 0xf97f4df75117a78c1A5a0DBb814Af92458539FB4;
    address public constant WETH = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;

    IERC20 public linkToken = IERC20(LINK);
    IERC20 public wethToken = IERC20(WETH);

    uint24 public constant poolFee = 3000;

    constructor() {}

     function swapExactOutputSingle(
        uint256 amountOut, 
        uint256 amountInMaximum,
        uint160 sqrtPriceLimitX96
        )
        external
        returns (uint256 amountIn)
    {
        wethToken.approve(address(swapRouter), amountInMaximum);

        ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter
            .ExactOutputSingleParams({
                tokenIn: WETH,
                tokenOut: LINK,
                fee: poolFee,
                recipient: address(this),
                //deadline: block.timestamp,
                amountOut: amountOut,
                // this needs to be set to avoid slippage
                amountInMaximum: amountInMaximum,
                // our limit price
                sqrtPriceLimitX96: sqrtPriceLimitX96
            });

        amountIn = swapRouter.exactOutputSingle(params);

        if (amountIn < amountInMaximum) {
            linkToken.approve(address(swapRouter), 0);
            linkToken.transfer(address(this), amountInMaximum - amountIn);
        }
    }

    function swapExactInputSingle(
        uint256 amountIn, 
        uint256 amountOutMinimum,
        uint160 sqrtPriceLimitX96
        )
        external
        returns (uint256 amountOut)
    {
        linkToken.approve(address(swapRouter), amountIn);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: WETH,
                tokenOut: LINK,
                fee: poolFee,
                recipient: address(this),
                //deadline: block.timestamp,
                amountIn: amountIn,
                // this needs to be set to avoid slippage
                amountOutMinimum: amountOutMinimum,
                // this needs to be our limit price
                sqrtPriceLimitX96: sqrtPriceLimitX96
            });

        amountOut = swapRouter.exactInputSingle(params);
    }
}
