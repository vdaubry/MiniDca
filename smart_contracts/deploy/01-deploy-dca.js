const { network, ethers } = require("hardhat");
const {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config");

module.exports = async (hre) => {
  console.log("Deploying Dca...");

  const { getNamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  /***********************************
   *
   * Deploy DCA smart contract
   *
   ************************************/

  console.log("---------------------------------");
  console.log(`Deploy Dca with owner : ${deployer}`);

  const dca = await deploy("Dca", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
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
    await verify(nftMarketplace.address, arguments);
  }
  log("----------------------------------------------------");
};

module.exports.tags = ["all", "dca"];
