// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  
  const FlashLoan = await hre.ethers.getContractFactory("FlashLoan");
  // below is deployes to goerli network
  const flashLoan = await FlashLoan.deploy('0xc4dCB5126a3AfEd129BC3668Ea19285A9f56D15D');
  

  await flashLoan.deployed();
  console.log("Flashloan deployed: ", flashLoan.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
