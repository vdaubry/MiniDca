# MiniDCA

This project demonstrates a basic DCA protocol. Similar to mean.finance


## start a local blockchain and deploy smart contract 

```shell
hh node --network hardhat
```

## Mint USDC locally :

```shell
hh run ./scripts/mintUsdc.js --network localhost
```

## Tests :

```shell
hh test
```

## Gas report :

```shell
hh test
```

=> Results in gas-report.txt

## Deploy to testnet

```shell
hh deploy --network goerli
```
