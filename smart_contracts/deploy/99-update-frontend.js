const fs = require("fs");
const { network, ethers } = require("hardhat");
const {
  developmentChains,
  USDC_CONTRACT_ADRESSES,
  USDC_TESTNET_ABI,
} = require("../helper-hardhat-config");

const frontendAddressesFile = "../frontend/constants/contractAddresses.json";
const frontendDcaAbiFile = "../frontend/constants/dca_abi.json";
const frontendUsdcAbiFile = "../frontend/constants/usdc_abi.json";

module.exports = async (hre) => {
  await updateAddresses();
  await updateAbi();
};

const updateAddresses = async () => {
  const dca = await ethers.getContract("Dca");
  const adresses = JSON.parse(fs.readFileSync(frontendAddressesFile, "utf8"));
  const chainId = network.config.chainId;

  let usdc_address = "";
  if (developmentChains.includes(network.name)) {
    const usdc = await ethers.getContract("Usdc");
    usdc_address = usdc.address;
  } else {
    usdc_address = USDC_CONTRACT_ADRESSES[chainId]["address"];
  }

  adresses[chainId] = {
    dca: dca.address,
    usdc: usdc_address,
  };

  fs.writeFileSync(frontendAddressesFile, JSON.stringify(adresses));
};

const updateAbi = async () => {
  const dca = await ethers.getContract("Dca");
  fs.writeFileSync(
    frontendDcaAbiFile,
    dca.interface.format(ethers.utils.FormatTypes.json)
  );

  let usdc_abi_json = "";
  if (developmentChains.includes(network.name)) {
    const usdc = await ethers.getContract("Usdc");
    usdc_abi_json = usdc.interface.format(ethers.utils.FormatTypes.json);
  } else {
    usdc_abi_json = JSON.stringify(USDC_TESTNET_ABI);
  }

  fs.writeFileSync(frontendUsdcAbiFile, usdc_abi_json);
};

module.exports.tags = ["all", "frontend"];
