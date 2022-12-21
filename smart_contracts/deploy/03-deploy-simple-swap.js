const { network, ethers } = require("hardhat");
const {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;
  const chainId = network.config.chainId;

  /***********************************
   *
   * Deploy SimpleSwap smart contract
   *
   ************************************/

  log("---------------------------------");
  log(`Deploy SimpleSwap with owner : ${deployer}`);

  const router_address = networkConfig[network.config.chainId].swapRouter;

  const arguments = [router_address];
  const sampleLog = await deploy("SimpleSwap", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });
};

module.exports.tags = ["all", "simple-swap"];
