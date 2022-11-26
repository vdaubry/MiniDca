const fs = require("fs");
const { network, ethers } = require("hardhat");

const frontendAddressesFile = "../frontend/constants/contractAddresses.json";
const frontendAbiFile = "../frontend/constants/abi.json";

module.exports = async (hre) => {
  await updateAddresses();
  await updateAbi();
};

const updateAddresses = async () => {
  const dca = await ethers.getContract("Dca");
  const adresses = JSON.parse(fs.readFileSync(frontendAddressesFile, "utf8"));
  const chainId = network.config.chainId;
  adresses[chainId] = {
    dca: dca.address,
  };

  fs.writeFileSync(frontendAddressesFile, JSON.stringify(adresses));
};

const updateAbi = async () => {
  const dca = await ethers.getContract("Dca");

  fs.writeFileSync(
    frontendAbiFile,
    JSON.stringify(dca.interface.format(ethers.utils.FormatTypes.JSON))
  );
};

module.exports.tags = ["all", "frontend"];
