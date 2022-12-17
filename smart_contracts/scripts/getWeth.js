const { ethers, getNamedAccounts, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { getAbi } = require("./getAbi");
require("dotenv").config();

const getWeth = async (amount, receiver) => {
  const wethTokenAddress = networkConfig[network.config.chainId].wethToken;
  const wethAbi = JSON.parse(await getAbi(wethTokenAddress));
  const iWeth = await ethers.getContractAt(wethAbi, wethTokenAddress, receiver);

  const txResponse = await iWeth.deposit({
    value: amount,
  });
  await txResponse.wait(1);
  const wethBalance = ethers.utils.formatEther(await iWeth.balanceOf(receiver));
  console.log(`Got ${wethBalance.toString()} WETH`);
};

module.exports = { getWeth };
