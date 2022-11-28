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

  // Step1 : Mint Usdc and send to account 1
  console.log("Mint Usdc for account 1");
  const mintTx = await usdc.mint(user, ethers.utils.parseEther("100"));
  await mintTx.wait(1);

  // Step2 : Mint Usdc and send to account 2
  console.log("Mint Usdc for account 2");
  const mintTx2 = await usdc.mint(user2, ethers.utils.parseEther("100"));
  await mintTx2.wait(1);

  // Step3 : Approve contract to spend USDC
  console.log("User 1 approves contract");

  //Approve max (2^256 - 1 )
  const approve_amount = ethers.utils.formatEther(
    "115792089237316195423570985008687907853269984665640564039457584007913129639935"
  );

  const userSigner = await ethers.getSigner(user);
  const connectedUserUsdc = await usdc.connect(userSigner);
  const approveTx1 = await connectedUserUsdc.approve(dca, approve_amount);
  await approveTx1.wait(1);

  const user2Signer = await ethers.getSigner(user2);
  const connectedUser2Usdc = await usdc.connect(user2Signer);
  const approveTx2 = await connectedUser2Usdc.approve(dca, approve_amount);
  await approveTx2.wait(1);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
