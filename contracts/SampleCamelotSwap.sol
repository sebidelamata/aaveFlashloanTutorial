// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;
pragma abicoder v2;

import {SafeMath} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/SafeMath.sol";

// Camelot
interface IUniswapV2Router01 {
  function factory() external pure returns (address);
  function WETH() external pure returns (address);

  function addLiquidity(
    address tokenA,
    address tokenB,
    uint amountADesired,
    uint amountBDesired,
    uint amountAMin,
    uint amountBMin,
    address to,
    uint deadline
  ) external returns (uint amountA, uint amountB, uint liquidity);

  function addLiquidityETH(
    address token,
    uint amountTokenDesired,
    uint amountTokenMin,
    uint amountETHMin,
    address to,
    uint deadline
  ) external payable returns (uint amountToken, uint amountETH, uint liquidity);

  function removeLiquidity(
    address tokenA,
    address tokenB,
    uint liquidity,
    uint amountAMin,
    uint amountBMin,
    address to,
    uint deadline
  ) external returns (uint amountA, uint amountB);

  function removeLiquidityETH(
    address token,
    uint liquidity,
    uint amountTokenMin,
    uint amountETHMin,
    address to,
    uint deadline
  ) external returns (uint amountToken, uint amountETH);

  function removeLiquidityWithPermit(
    address tokenA,
    address tokenB,
    uint liquidity,
    uint amountAMin,
    uint amountBMin,
    address to,
    uint deadline,
    bool approveMax, 
    uint8 v, 
    bytes32 r, 
    bytes32 s
  ) external returns (uint amountA, uint amountB);

  function removeLiquidityETHWithPermit(
    address token,
    uint liquidity,
    uint amountTokenMin,
    uint amountETHMin,
    address to,
    uint deadline,
    bool approveMax, 
    uint8 v, 
    bytes32 r, 
    bytes32 s
  ) external returns (uint amountToken, uint amountETH);

  function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB);
}

interface ICamelotRouter is IUniswapV2Router01 {
  function swapExactTokensForTokensSupportingFeeOnTransferTokens(
    uint amountIn,
    uint amountOutMin,
    address[] calldata path,
    address to,
    address referrer,
    uint deadline
  ) external;
}

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);
}

contract SampleCamelotSwap {
    address public constant routerAddress = 0xc873fEcbd354f5A56E00E710B90EF4201db2448d;
    ICamelotRouter public immutable swapRouter = ICamelotRouter(routerAddress);

    address public constant BOOP = 0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3;
    address public constant WETH = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;

    IERC20 public boopToken = IERC20(BOOP);
    IERC20 public wethToken = IERC20(WETH);

    address[] path = [
            WETH,
            BOOP
        ];

    address public to = address(this);

    address public referrer = address(0x0000000000000000000000000000000000000000);

    uint public constant poolFee = 300;

    constructor() {}

    function swapExactInputSingle(
        uint amountIn, 
        uint amountOutMin
        )
        external
        returns (bool)
    {
        uint256 blocktime = uint(block.timestamp);
        uint deadline = uint(blocktime);

        wethToken.approve(address(swapRouter), amountIn);

        swapRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            amountIn,
            amountOutMin,
            path,
            to,
            referrer,
            deadline
        );

        return true;
    }
}
