// SPDX-License-Identifier: MIT

// the contracts import from this version
pragma solidity 0.8.10;

// our imports
import {FlashLoanSimpleReceiverBase} from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import {SafeMath} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/SafeMath.sol";

contract FlashLoan is FlashLoanSimpleReceiverBase {

    using SafeMath for uint256;

    // declare an owner to the contract (me)
    address payable owner;

    // call constructor of flashloansimplerecieverbase
    constructor(address _addressProvider) 
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

    // add custom logic

    // create a variable to hold how much we owe aave
    uint256 amountOwed = amount.add(premium);

    // get approval to use the token we want to borrow
    IERC20(asset).approve(address(POOL), amountOwed);

    return true;

  }

  // create function to actually call the loan
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

    POOL.flashLoanSimple(
        receiverAddress,
        asset,
        amount,
        params,
        referralCode
    );


  }


  function getBalance(address _tokenAddress) external view returns(uint256){

    // returns the token balance for this address
    return IERC20(_tokenAddress).balanceOf(address(this));

  }

    // a function to be able to withdraw specified tokens from the contract
    function withdraw(address _tokenAddress) external onlyOwner{

        // declare ierc20 token
        IERC20 token = IERC20(_tokenAddress);

        // transfer from this instance
        token.transfer(msg.sender, token.balanceOf(address(this)));

    }

    // a modifier for only owner
    modifier onlyOwner(){
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    receive() external payable{}




}