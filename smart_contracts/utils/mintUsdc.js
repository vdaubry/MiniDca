const fs = require("fs");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { ethers, network, getNamedAccounts } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");

const mintUsdc = async (receiverAddress, amount) => {
  // We can only mint USDC locally
  if (!developmentChains.includes(network.name)) {
    return;
  }

  const usdcTokenAddress = networkConfig[network.config.chainId].usdcToken;
  const usdcAbi = JSON.parse(
    fs.readFileSync("./utils/abis/usdc_abi.json", "utf8")
  );
  const receiverSigner = await ethers.getSigner(receiverAddress);
  const usdc = await ethers.getContractAt(
    usdcAbi,
    usdcTokenAddress,
    receiverSigner
  );

  const usdcOwner = await usdc.owner();
  await helpers.impersonateAccount(usdcOwner);
  const impersonatedUsdcOwner = await ethers.getSigner(usdcOwner);
  const connectedUsdcOwner = await usdc.connect(impersonatedUsdcOwner);

  // Send ETH to the owner so it can pay for the gas
  const tx = await receiverSigner.sendTransaction({
    to: usdcOwner,
    value: ethers.utils.parseEther("10.0"),
  });
  tx.wait(1);

  const updateMasterTx = await connectedUsdcOwner.updateMasterMinter(
    receiverAddress
  );
  await updateMasterTx.wait(1);

  const connectedUsdcMinter = await usdc.connect(receiverSigner);

  const configureMinterTx = await connectedUsdcMinter.configureMinter(
    receiverAddress,
    ethers.constants.MaxInt256
  );
  await configureMinterTx.wait(1);

  console.log("Mint Usdc for deployer");
  const mintTx = await connectedUsdcMinter.mint(receiverAddress, amount);
  await mintTx.wait(1);

  const usdcBalance = ethers.utils.formatUnits(
    await connectedUsdcMinter.balanceOf(receiverAddress),
    6
  );
  console.log(`Got ${usdcBalance.toString()} USDC`);

  return usdcBalance;
};

module.exports = { mintUsdc };
