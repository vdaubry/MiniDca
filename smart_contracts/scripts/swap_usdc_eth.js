const { ethers, getNamedAccounts } = require("hardhat");
const { getAbi } = require("./getAbi");
const { networkConfig } = require("../helper-hardhat-config");

const AMOUNT = ethers.utils.parseUnits("100", 6);

async function main() {
  const { deployer } = await getNamedAccounts();

  const simpleSwap = await ethers.getContract("SimpleSwap", deployer);

  const usdcTokenAddress = networkConfig[network.config.chainId].usdcToken;
  const usdc = await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
    usdcTokenAddress,
    deployer
  );

  const wethTokenAddress = networkConfig[network.config.chainId].wethToken;
  const iWeth = await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
    wethTokenAddress,
    deployer
  );

  await usdc.approve(simpleSwap.address, ethers.constants.MaxInt256);

  const tx = await simpleSwap.swap(AMOUNT, usdcTokenAddress, wethTokenAddress);
  await tx.wait(1);

  const contractUsdcBalance = ethers.utils.formatEther(
    await usdc.balanceOf(simpleSwap.address)
  );
  console.log(`Contract balance : ${contractUsdcBalance.toString()} USDC`);

  const deployerWethBalance = ethers.utils.formatEther(
    await iWeth.balanceOf(deployer)
  );
  console.log(`Deployer WETH balance : ${deployerWethBalance.toString()} WETH`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
