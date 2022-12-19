const fs = require("fs");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { ethers, network, getNamedAccounts } = require("hardhat");
const { getAbi } = require("./getAbi");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");

const AMOUNT = ethers.utils.parseUnits("1000", 6);

const mintUsdc = async (receiverAddress) => {
  // We can only mint USDC locally
  if (!developmentChains.includes(network.name)) {
    return;
  }

  const usdcTokenAddress = networkConfig[network.config.chainId].usdcToken;
  const usdcAbi = JSON.parse(
    fs.readFileSync("./utils/abis/usdc_abi.json", "utf8")
  );
  const deployerSigner = await ethers.getSigner(receiverAddress);
  const usdc = await ethers.getContractAt(
    usdcAbi,
    usdcTokenAddress,
    deployerSigner
  );

  const usdcOwner = await usdc.owner();
  await helpers.impersonateAccount(usdcOwner);
  const impersonatedUsdcOwner = await ethers.getSigner(usdcOwner);
  const connectedUsdcOwner = await usdc.connect(impersonatedUsdcOwner);

  const updateMasterTx = await connectedUsdcOwner.updateMasterMinter(
    receiverAddress
  );
  await updateMasterTx.wait(1);

  const connectedUsdcMinter = await usdc.connect(deployerSigner);

  const configureMinterTx = await connectedUsdcMinter.configureMinter(
    receiverAddress,
    ethers.constants.MaxInt256
  );
  await configureMinterTx.wait(1);

  console.log("Mint Usdc for deployer");
  const mintTx = await connectedUsdcMinter.mint(receiverAddress, AMOUNT);
  await mintTx.wait(1);

  const usdcBalance = ethers.utils.formatUnits(
    await connectedUsdcMinter.balanceOf(receiverAddress),
    6
  );
  console.log(`Got ${usdcBalance.toString()} USDC`);
};

async function main() {
  const deployer = (await getNamedAccounts()).deployer;
  await mintUsdc(deployer);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

module.exports = { mintUsdc };
