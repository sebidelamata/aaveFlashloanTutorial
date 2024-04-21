// SPDX-License-Identifier: MIT

//pragma version
pragma solidity 0.8.10;
pragma abicoder v2;

// our imports
// aave
import {FlashLoanSimpleReceiverBase} from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
//erc20
interface IERC20 {
    function balanceOf(address account) 
      external view 
      returns (uint256);

    function transfer(address recipient, uint256 amount)
      external
      returns (bool);

    function approve(address spender, uint256 amount) 
      external 
      returns (bool);
}
// safemath
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

    function exactInputSingle(ExactInputSingleParams calldata params) 
      external payable 
      returns (uint256 amountOut);

    function exactOutputSingle(ExactOutputSingleParams calldata params) 
      external payable 
      returns (uint256 amountIn);
}

// camelot
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
  function getAmountsOut(
    uint amountIn, 
    address[] calldata path
    ) external view returns (uint[] memory amounts);
}

contract FlashLoanBoopCheapUniswap is FlashLoanSimpleReceiverBase {

    using SafeMath for uint256;

    // declare an owner to the contract (me)
    address payable owner;

    // we need to set vars for addresses for dai and usdc and define them as erc20s
    // also dex stuff
    address private constant wethAddress = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;
    address private constant boopAddress = 0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3;
    IERC20 public WETH = IERC20(wethAddress);
    IERC20 public BOOP = IERC20(boopAddress);

    // define Uniswap constants
    address public constant uniswapRouterAddress = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
    ISwapRouter public immutable uniswapSwapRouter = ISwapRouter(uniswapRouterAddress);
    uint24 public constant uniswapPoolFee = 10000;

    //mdefine camelot constants
    address public constant camelotRouterAddress = 0xc873fEcbd354f5A56E00E710B90EF4201db2448d;
    ICamelotRouter public immutable swapRouter = ICamelotRouter(camelotRouterAddress);
    address[] path = [
            boopAddress,
            wethAddress
        ];
    address public to = address(this);
    address public referrer = address(0x0000000000000000000000000000000000000000);
    uint public constant poolFee = 300;

    // call constructor of flashloansimplerecieverbase
    constructor(
        // addressProvider is the aave flashloan provider pool
        address _addressProvider 
        ) 
        FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider))
        {
            // set message sender as owner 
            owner = payable(msg.sender);
        }


    function executeOperation(
    address asset,
    uint256 amount,
    uint256 premium,
    address initiator,
    bytes calldata params
  ) external override returns (bool){

    // we have funds at this point

    // add custom logic

    // arbitrage operation
    // we would do this if dai is cheap on one exchange and expensive on the other
    // first deposit 1000 usdc
    // dexContract.depositUSDC(1000000000);
    // // buy dai with the usdc
    // dexContract.buyDAI();
    // // deposit dai
    // dexContract.depositDAI(dai.balanceOf(address(this)));
    // // sell dai for usdc
    // dexContract.sellDAI();

    // These are our params the user passed in, we need to decode so we can use them
    // in our flashloan logic
    (
      uint256 _amountOutMinimumUniswap,
      uint160 _sqrtPriceLimitX96Uniswap,
      uint256 _amountOutMinimumCamelot
    ) = abi.decode(
      params, 
      (
        uint256,
        uint160,
        uint256
      )
    );

    // Deposit WETH on UNISWAP buy BOOP on UNISWAP
    // approve weth
    WETH.approve(address(uniswapSwapRouter), amount);
    //create swap params on uniswap
    ISwapRouter.ExactInputSingleParams memory uniswapParams = ISwapRouter
        .ExactInputSingleParams({
            tokenIn: wethAddress,
            tokenOut: boopAddress,
            fee: uniswapPoolFee,
            recipient: address(this),
            deadline: block.timestamp,
            amountIn: amount,
            // this needs to be set to avoid slippage
            amountOutMinimum: _amountOutMinimumUniswap,
            // this needs to be our limit price
            sqrtPriceLimitX96: _sqrtPriceLimitX96Uniswap
        });
    // execute swap weth for boop on uniswap
    uint256 amountOut = uniswapSwapRouter.exactInputSingle(uniswapParams);

    // Deposit BOOP on Camelot and sell for WETH
    uint256 boopAmount = BOOP.balanceOf(address(this));

    // approve boop on camelot
    BOOP.approve(camelotRouterAddress, boopAmount);
    // Get the router instance
    ICamelotRouter camelotRouter = ICamelotRouter(camelotRouterAddress);
    // Perform the token swap
    camelotRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(
        boopAmount,
        _amountOutMinimumCamelot,
        path,
        to,
        referrer,
        uint(block.timestamp)
    );


    // FINISH ARBITRAGE LOGIC

    // create a variable to hold how much we owe aave
    uint256 amountOwed = amount.add(premium);

    // get approval to use the token we want to borrow
    IERC20(asset).approve(address(POOL), amountOwed);

    return true;

  }

  // create function to actually call the loan (starts the actual process)
  function requestFlashLoan(
    address _token, 
    uint256 _amount, 
    uint256 _amountOutMinimumUniswap,
    uint160 _sqrtPriceLimitX96Uniswap,
    uint256 _amountOutMinimumCamelot
    ) public {
    // declares that this address will recieve the loan
    address receiverAddress = address(this);
    // this is the address of the token
    address asset = _token;
    // inherit amount from args
    uint256 amount = _amount;
    // these are the params for price etc that will be passed to the flashloan
    bytes memory paramsInput = abi.encode( 
      _amountOutMinimumUniswap,
      _sqrtPriceLimitX96Uniswap,
      _amountOutMinimumCamelot
      );
    uint16 referralCode = 0;
    //call function with variables defined above
    POOL.flashLoanSimple(
        receiverAddress,
        asset,
        amount,
        paramsInput,
        referralCode
    );
  }

  // utility functions
  function getBalance(address _tokenAddress) external view returns(uint256){
    // returns the token balance for this address
    return IERC20(_tokenAddress).balanceOf(address(this));
  }

  function getOwner() external view returns(address){
    // returns the token balance for this address
    return owner;
  }

  // a function to be able to withdraw specified tokens from the contract
  function withdraw(address _tokenAddress) external onlyOwner{
      // declare ierc20 token
      IERC20 token = IERC20(_tokenAddress);
      // transfer from this instance
      token.transfer(msg.sender, token.balanceOf(address(this)));
  }

    //so we can move it to cold wallet
    function transferOwner(address payable _newOwner) external onlyOwner{
        owner = _newOwner;
    }

    // a modifier for only owner
    modifier onlyOwner(){
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    receive() external payable{}
}