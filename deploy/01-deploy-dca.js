const { network, ethers } = require("hardhat");

module.exports = async (hre) => {
  console.log("Deploying Dca...");

  const { getNamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("---------------------------------");
  console.log(`Deploy Dca with owner : ${deployer}`);

  const dca = await deploy("Dca", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
};

module.exports.tags = ["all", "dca"];
