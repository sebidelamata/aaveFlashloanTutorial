// SPDX-License-Identifier: MIT

// the contracts import from this version
pragma solidity 0.8.10;

// our imports
import {FlashLoanSimpleReceiverBase} from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import {SafeMath} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/SafeMath.sol";


//first we need to create an interface to the dex
  interface IDex {
    function depositUSDC(uint256 _amount) external;
    function depositDAI(uint256 _amount) external;
    function buyDAI() external;
    function sellDAI() external;
  }

contract FlashLoanSampleArbitrage is FlashLoanSimpleReceiverBase {

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

    // call constructor of flashloansimplerecieverbase
    constructor(address _addressProvider) 
        FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider))
        {
            // set message sender as owner 
            owner = payable(msg.sender);
            dai = IERC20(daiAddress);
            usdc = IERC20(usdcAddress);
            dexContract = IDex(dexContractAddress);
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