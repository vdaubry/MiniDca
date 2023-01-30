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
  const KEEPERS_UPDATE_INTERVAL = "60"; // 24 seconds

  /***********************************
   *
   * Deploy DCA smart contract
   *
   ************************************/

  log("---------------------------------");
  log(`Deploy Dca with owner : ${deployer}`);

  const usdcTokenAddress = networkConfig[chainId].usdcToken;
  const swapper_address = (await ethers.getContract("SimpleSwap", deployer))
    .address;
  const arguments = [
    usdcTokenAddress,
    KEEPERS_UPDATE_INTERVAL,
    swapper_address,
  ];
  await deploy("Dca", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });

  const dca = await ethers.getContract("Dca", deployer);
  await dca.initialize({ gasLimit: 3e7 });

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
