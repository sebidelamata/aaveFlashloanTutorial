const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("FlashLoanSampleArbitrage", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  it("Should deploy", async function(){
    // Contracts are deployed using the first signer/account by default
    owner = await ethers.getSigners();

    const FlashLoan = await ethers.getContractFactory("FlashLoanSampleArbitrage");
    // below is deployes to sepolia network, the address is PoolAddressesProvider in Aave docs
    const flashLoan = await FlashLoan.deploy('0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb');
    await flashLoan.waitForDeployment();
    const contractAddress = await flashLoan.getAddress()
    console.log(contractAddress)
    expect(contractAddress).not.equals(null)
  })
})
