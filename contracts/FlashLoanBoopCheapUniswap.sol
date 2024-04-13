// SPDX-License-Identifier: MIT

// the contracts import from this version
pragma solidity 0.8.10;

// our imports
// aave
import {FlashLoanSimpleReceiverBase} from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
//erc20
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
// safemath
import {SafeMath} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/SafeMath.sol";
// uniswap
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
// camelot
import '../interfaces/ICamelotRouter.sol';

//first we need to create an interface to the dex
  interface IDex {
    function depositUSDC(uint256 _amount) external;
    function depositDAI(uint256 _amount) external;
    function buyDAI() external;
    function sellDAI() external;
  }

contract FlashLoanSampleBoopCheapUniswap is FlashLoanSimpleReceiverBase {

    using SafeMath for uint256;

    // declare an owner to the contract (me)
    address payable owner;

    // we need to set vars for addresses for dai and usdc and define them as erc20s
    // also dex stuff
    address private immutable daiAddress = 0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357;
    address private immutable usdcAddress = 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8;
    address private immutable dexContractAddress = 0x3220efEf095af65cF32C81678c8835C9e16dF27d;

    IERC20 private dai;
    IERC20 private usdc;
    IDex private dexContract;
    // define Uniswap constants
    ISwapRouter public immutable swapRouter;
    uint24 public constant feeTier = 3000;
    //mdefine camelot constants
    address public camelotRouterAddress;

    // call constructor of flashloansimplerecieverbase
    constructor(
        // addressProvider is the aave flashloan provider pool
        address _addressProvider, 
        // ISwapRouter is the uniswap3 router
        ISwapRouter _swapRouter,
        // uniswap price limit
        uint160 _uniswapPriceLimit
        // camelot router
        address _camelotRouterAddress
        // camelot price limit
        uint160 _camelotPriceLimit
        ) 
        FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider))
        {
            // set message sender as owner 
            owner = payable(msg.sender);
            dai = IERC20(daiAddress);
            usdc = IERC20(usdcAddress);
            dexContract = IDex(dexContractAddress);
            swapRouter = _swapRouter;
            uniswapPriceLimit = _uniswapPriceLimit;
            camelotRouterAddress = _camelotRouterAddress;
            camelotPriceLimit = _camelotPriceLimit;
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
    dexContract.depositUSDC(1000000000);
    // buy dai with the usdc
    dexContract.buyDAI();
    // deposit dai
    dexContract.depositDAI(dai.balanceOf(address(this)));
    // sell dai for usdc
    dexContract.sellDAI();


    // Deposit WETH on UNISWAP buy BOOP on UNISWAP
    // Approve the router to spend WETH9.
    TransferHelper.safeApprove(WETH9, address(swapRouter), 1000000000000000000);
    // Note: To use this example, you should explicitly set slippage limits, omitting for simplicity
    // modeled 5%
    uint256 minOut = /* Calculate min output */ 1000000000 - ((1000000000 * 5)/100);
    // Create the params that will be used to execute the swap
    ISwapRouter.ExactInputSingleParams memory params =
        ISwapRouter.ExactInputSingleParams({
            tokenIn: WETH9,
            tokenOut: DAI,
            fee: feeTier,
            recipient: msg.sender,
            deadline: block.timestamp,
            amountIn: 1000000000,
            amountOutMinimum: minOut,
            sqrtPriceLimitX96: uniswapPriceLimit
        });
    // The call to `exactInputSingle` executes the swap.
    amountOut = swapRouter.exactInputSingle(params);


    // Deposit BOOP on Camelot and sell for WETH
    uint160 boopAmount = dai.balanceOf(address(this))
    // approve boop on camelot
    IERC20(tokenToSwapAddress).approve(camelotRouterAddress, boopAmount);
    // Path for the swap (token to swap -> desired token)
    // array of token addresses
    address[] memory path = new address[](2);
    path[0] = WETH9;
    path[1] = daiAddress;
    // Get the router instance
    ICamelotRouter camelotRouter = ICamelotRouter(camelotRouterAddress);
    // calc amount out min
    uint160 amountOutMin = boopAmount / camelotPriceLimit - (((boopAmount / camelotPriceLimit)*5)/100)
    // Perform the token swap
        camelotRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            boopAmount,
            amountOutMin,
            path,
            address(this), // recipient
            address(0), // referrer
            deadline
        );


    // FINISH ARBITRAGE LOGIC

    // create a variable to hold how much we owe aave
    uint256 amountOwed = amount.add(premium);

    // get approval to use the token we want to borrow
    IERC20(asset).approve(address(POOL), amountOwed);

    return true;

  }

  // create function to actually call the loan (starts the actual process)
  function requestFlashLoan(address _token, uint256 _amount) public {
    // declares that this address will recieve the loan
    address receiverAddress = address(this);
    // this is the address of the token
    address asset = _token;
    // inherit amount from args
    uint256 amount = _amount;
    // cal default values for the remainder
    bytes memory params = "";
    uint16 referralCode = 0;
    //call function with variables defined above
    POOL.flashLoanSimple(
        receiverAddress,
        asset,
        amount,
        params,
        referralCode
    );
  }

  // we need functions to approve USDC and DAI tokens
  function approveUSDC(uint256 _amount) external returns(bool){
    return usdc.approve(dexContractAddress, _amount);
  }

  function allowanceUSDC() external view returns(uint256){
    return usdc.allowance(address(this), dexContractAddress);
  }

  function approveDAI(uint256 _amount) external returns(bool){
    return dai.approve(dexContractAddress, _amount);
  }

  function allowanceDAI() external view returns(uint256){
    return dai.allowance(address(this), dexContractAddress);
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