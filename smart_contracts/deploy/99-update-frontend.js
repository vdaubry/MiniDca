const fs = require("fs");
const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { getAbi } = require("../utils/getAbi");

const frontendAddressesFile = "../frontend/constants/contractAddresses.json";
const frontendDcaAbiFile = "../frontend/constants/dca_abi.json";
const frontendERC20AbiFile = "../frontend/constants/erc20_abi.json";

module.exports = async (hre) => {
  await updateAddresses();
  await updateAbi();
};

const updateAddresses = async () => {
  const dca = await ethers.getContract("Dca");
  const adresses = JSON.parse(fs.readFileSync(frontendAddressesFile, "utf8"));
  const chainId = network.config.chainId;
  const usdcTokenAddress = networkConfig[chainId].usdcToken;

  adresses[chainId] = {
    dca: dca.address,
    usdc: usdcTokenAddress,
  };

  fs.writeFileSync(frontendAddressesFile, JSON.stringify(adresses));
};

const updateAbi = async () => {
  const dca = await ethers.getContract("Dca");
  fs.writeFileSync(
    frontendDcaAbiFile,
    dca.interface.format(ethers.utils.FormatTypes.json)
  );

  let erc20Abi = fs.readFileSync("./utils/abis/erc20.json", "utf8");
  fs.writeFileSync(frontendERC20AbiFile, erc20Abi);
};

module.exports.tags = ["all", "frontend"];
