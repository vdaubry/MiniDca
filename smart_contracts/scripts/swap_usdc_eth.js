const { ethers, getNamedAccounts } = require("hardhat");
const { getAbi } = require("./getAbi");
const { getWeth } = require("./getUsdc");
const { networkConfig } = require("../helper-hardhat-config");

const AMOUNT = ethers.utils.parseEther("0.1");

async function main() {
  const { deployer } = await getNamedAccounts();

  const sampleLog = await ethers.getContract("SimpleSwap", deployer);

  const wethTokenAddress = networkConfig[network.config.chainId].wethToken;
  const iWeth = await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
    wethTokenAddress,
    deployer
  );

  const usdcTokenAddress = networkConfig[network.config.chainId].usdcToken;
  const dai = await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
    usdcTokenAddress,
    deployer
  );

  await getUSDC(ethers.utils.parseEther("1"), deployer);
  await iWeth.approve(sampleLog.address, ethers.constants.MaxInt256);

  const tx = await sampleLog.swap(AMOUNT, wethTokenAddress, daiTokenAddress);
  await tx.wait(1);

  const contractWethBalance = ethers.utils.formatEther(
    await iWeth.balanceOf(sampleLog.address)
  );
  console.log(`Contract balance : ${contractWethBalance.toString()} WETH`);

  const deployerDaiBalance = ethers.utils.formatEther(
    await dai.balanceOf(deployer)
  );
  console.log(`Deployer Dai balance : ${deployerDaiBalance.toString()} DAI`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
