const { network, ethers } = require("hardhat");
const {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  USDC_CONTRACT_ADRESSES,
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
   * Deploy DCA smart contract
   *
   ************************************/

  log("---------------------------------");
  log(`Deploy Dca with owner : ${deployer}`);

  const usdc_address = developmentChains.includes(network.name)
    ? (await ethers.getContract("Usdc", deployer)).address
    : USDC_CONTRACT_ADRESSES[chainId]["address"];

  const arguments = [usdc_address];
  const dca = await deploy("Dca", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });

  /***********************************
   *
   * Verify the deployment
   *
   ************************************/
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(dca.address, arguments);
  }
  log("----------------------------------------------------");
};

module.exports.tags = ["all", "dca"];
