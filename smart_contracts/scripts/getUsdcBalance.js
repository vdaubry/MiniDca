const { ethers, getNamedAccounts, network } = require("hardhat");
const {
  networkConfig,
  USDC_CONTRACT_ADRESSES,
} = require("../helper-hardhat-config");
require("dotenv").config();

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;
const AMOUNT = ethers.utils.parseEther("0.1");

async function main() {
  await getUsdcBalance();
}

async function getUsdcBalance() {
  const { deployer } = await getNamedAccounts();

  const walletAddress = "0x630565882a6d3691Fe32470Ff2981b3289CD9b87";

  const usdc = await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
    networkConfig[network.config.chainId].usdcToken,
    deployer
  );

  const wethBalance = await usdc.balanceOf(walletAddress);
  console.log(`Got ${wethBalance.toString()} USDC`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
