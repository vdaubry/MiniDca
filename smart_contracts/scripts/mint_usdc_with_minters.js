// This script only works with "ethers.getImpersonatedSigner"
// See : https://hardhat.org/hardhat-network/docs/guides/forking-other-networks#impersonating-accounts
// Issue opened : https://github.com/wighawag/hardhat-deploy-ethers/issues/31

const fs = require("fs");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { ethers, network, getNamedAccounts } = require("hardhat");
const { getAbi } = require("./getAbi");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");

const mintUsdc = async () => {
  // We can only mint USDC locally
  if (!developmentChains.includes(network.name)) {
    return;
  }

  const deployer = (await getNamedAccounts()).deployer;

  const usdcTokenAddress = networkConfig[network.config.chainId].usdcToken;
  const usdcAbi = JSON.parse(
    fs.readFileSync("./utils/abis/usdc_abi.json", "utf8")
  );
  const deployerSigner = await ethers.getSigner(deployer);
  const usdc = await ethers.getContractAt(
    usdcAbi,
    usdcTokenAddress,
    deployerSigner
  );

  const usdcOwner = await usdc.owner();
  const impersonatedUsdcOwner = await ethers.getImpersonatedSigner(usdcOwner);
  const connectedUsdcOwner = await usdc.connect(impersonatedUsdcOwner);

  const updateMasterTx = await connectedUsdcOwner.updateMasterMinter(deployer);
  await updateMasterTx.wait(1);

  const connectedUsdcMinter = await usdc.connect(deployerSigner);

  const configureMinterTx = await connectedUsdcMinter.configureMinter(
    deployer,
    ethers.constants.MaxInt256
  );
  await configureMinterTx.wait(1);

  console.log("Mint Usdc for deployer");
  const mintTx = await connectedUsdcMinter.mint(
    deployer,
    ethers.utils.parseUnits("100", 6)
  );
  await mintTx.wait(1);

  const usdcBalance = ethers.utils.formatUnits(
    await connectedUsdcMinter.balanceOf(deployer),
    6
  );
  console.log(`Got ${usdcBalance.toString()} USDC`);
};

async function main() {
  await mintUsdc();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

module.exports = { mintUsdc };
