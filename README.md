# Aave Flashloan Arbitrage Tutorial

This is a template for performing flashloans using Aave for triangular arbitrage

Try running some of the following tasks:

```shell
npm install
```

deploy:
```shell
npx hardhat run --network sepolia scripts/deployFlashLoanSampleArbitrage.js    
```

verify:
```shell
npx hardhat verify --network sepolia <contractAddress/> "PoolAddressesProvider-Aave "
```
