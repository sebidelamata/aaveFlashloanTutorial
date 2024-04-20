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
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    struct ExactOutputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
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
    address public constant routerAddress = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
    ISwapRouter public immutable swapRouter = ISwapRouter(routerAddress);

    address public constant BOOP = 0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3;
    address public constant WETH = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;

    IERC20 public boopToken = IERC20(BOOP);
    IERC20 public wethToken = IERC20(WETH);

    uint24 public constant poolFee = 10000;

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
                tokenOut: BOOP,
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp,
                amountOut: amountOut,
                // this needs to be set to avoid slippage
                amountInMaximum: amountInMaximum,
                // our limit price
                sqrtPriceLimitX96: sqrtPriceLimitX96
            });

        amountIn = swapRouter.exactOutputSingle(params);

        if (amountIn < amountInMaximum) {
            boopToken.approve(address(swapRouter), 0);
            boopToken.transfer(address(this), amountInMaximum - amountIn);
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
        wethToken.approve(address(swapRouter), amountIn);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: WETH,
                tokenOut: BOOP,
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                // this needs to be set to avoid slippage
                amountOutMinimum: amountOutMinimum,
                // this needs to be our limit price
                sqrtPriceLimitX96: sqrtPriceLimitX96
            });

        amountOut = swapRouter.exactInputSingle(params);
    }
}
