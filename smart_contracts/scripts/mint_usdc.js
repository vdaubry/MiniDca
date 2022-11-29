const { ethers, network, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

async function main() {
  // We can only mint USDC locally
  if (!developmentChains.includes(network.name)) {
    return;
  }

  const { deployer, user, user2 } = await getNamedAccounts();
  const usdc = await ethers.getContract("Usdc", deployer);
  const dca = await ethers.getContract("Dca", deployer);

  // Step1 : Mint Usdc and send to deployer
  console.log("Mint Usdc for deployer");
  const mintTx = await usdc.mint(deployer, ethers.utils.parseUnits("100", 6));
  await mintTx.wait(1);

  // Step2 : Mint Usdc and send to account 1
  console.log("Mint Usdc for account 1");
  const mintTx2 = await usdc.mint(user, ethers.utils.parseUnits("100", 6));
  await mintTx2.wait(1);

  // Step3 : Approve contract to spend USDC

  //Approve max amount
  // const approve_amount = ethers.constants.MaxInt256;

  // console.log("User 1 approves contract");
  // const userSigner = await ethers.getSigner(user);
  // const connectedUserUsdc = await usdc.connect(userSigner);
  // const approveTx1 = await connectedUserUsdc.approve(
  //   dca.address,
  //   approve_amount
  // );
  // await approveTx1.wait(1);

  // console.log("User 2 approves contract");
  // const user2Signer = await ethers.getSigner(user2);
  // const connectedUser2Usdc = await usdc.connect(user2Signer);
  // const approveTx2 = await connectedUser2Usdc.approve(
  //   dca.address,
  //   approve_amount
  // );
  // await approveTx2.wait(1);

  // // Step4 : Deposit USDC

  // console.log("User 1 deposits usdc");
  // const connectedUserDca = await dca.connect(userSigner);
  // const depositTx = await connectedUserDca.deposit(50);
  // await depositTx.wait(1);

  // console.log("User 1 deposits usdc");
  // const connectedUser2Dca = await dca.connect(user2Signer);
  // const depositTx2 = await connectedUser2Dca.deposit(50);
  // await depositTx2.wait(1);

  // // Step5 : Withdraw USDC
  // console.log("User 1 withdraws usdc");
  // const withdrawTx = await connectedUserDca.withdraw();
  // await withdrawTx.wait(1);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
