const { ethers, getNamedAccounts } = require("hardhat");
const { mintUsdc } = require("../utils/mintUsdc");

async function main() {
  const { deployer } = await getNamedAccounts();
  const amount = ethers.utils.parseUnits("1000", 6);
  await mintUsdc(deployer, amount);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
