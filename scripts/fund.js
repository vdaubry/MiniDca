const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  const { deployer, user } = await getNamedAccounts();
  const dca = await ethers.getContract("Dca", deployer);
  console.log(`Got contract Dca at ${dca.address}`);
  console.log("Fund contract");
  const fundTx = await dca.fund({
    value: ethers.utils.parseEther("0.1"),
  });
  await fundTx.wait(1);

  await displayBalances(dca, deployer);

  console.log("Withdraw deployer funds");
  const withdrawTx = await dca.withdraw();
  await withdrawTx.wait(1);

  await displayBalances(dca, deployer);

  console.log("Try to withdraw with another user");
  const connectedUserDca = await dca.connect(user);
  const withdrawTx1 = await connectedUserDca.withdraw();
  await withdrawTx1.wait(1);
  await displayBalances(dca, user);
}

const displayBalances = async (dca, deployer) => {
  const amountInvested = await dca.getAmountInvestedForAddress(deployer);
  console.log(
    `Amount funded in contract : ${ethers.utils.formatEther(
      amountInvested.toString()
    )}`
  );

  const remainingUserbalance = await ethers.provider.getBalance(deployer);
  console.log(
    `Amount funded in contract : ${ethers.utils.formatEther(
      remainingUserbalance.toString()
    )}`
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
