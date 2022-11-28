const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("dca", () => {
      let deployer;
      let user;
      let dca;

      beforeEach(async () => {
        await deployments.fixture(["all"]);
        deployer = (await getNamedAccounts()).deployer;
        user = (await getNamedAccounts()).user;
        dca = await ethers.getContract("Dca", deployer);
        usdc = await ethers.getContract("Usdc", deployer);

        const mintTx = await usdc.mint(
          deployer,
          ethers.utils.parseUnits("100", 6)
        );
        await mintTx.wait(1);

        await usdc.approve(dca.address, ethers.constants.MaxInt256);
      });

      describe("deposit", () => {
        it("sets deposited amount", async () => {
          await dca.deposit(50);

          const amountInvestedDeployer = await dca.getAmountInvestedForAddress(
            deployer
          );
          assert.equal(
            amountInvestedDeployer.toString(),
            ethers.utils.parseUnits("50", 6)
          );

          const amountInvestedUser = await dca.getAmountInvestedForAddress(
            user
          );
          assert.equal(amountInvestedUser.toString(), "0");
        });

        it("transfers funds from user to contract", async () => {
          const startDcaBalance = await usdc.balanceOf(dca.address);
          assert.equal(startDcaBalance.toString(), "0");

          const startDeployerBalance = await usdc.balanceOf(deployer);
          assert.equal(
            startDeployerBalance.toString(),
            ethers.utils.parseUnits("100", 6).toString()
          );

          await dca.deposit(50);

          const finalDeployerBalance = await usdc.balanceOf(deployer);
          assert.equal(
            finalDeployerBalance.toString(),
            ethers.utils.parseUnits("50", 6)
          );

          const finalDcaBalance = await usdc.balanceOf(dca.address);
          assert.equal(
            finalDcaBalance.toString(),
            ethers.utils.parseUnits("50", 6)
          );
        });
      });

      describe("withdraw", () => {
        it("returns tokens to sender", async () => {
          await dca.deposit(50);

          await dca.withdraw();

          const amountInvestedDeployer = await dca.getAmountInvestedForAddress(
            deployer
          );
          assert.equal(amountInvestedDeployer.toString(), "0");

          const dcaBalance = await usdc.balanceOf(dca.address);
          assert.equal(dcaBalance.toString(), "0");

          const deployerBalance = await usdc.balanceOf(deployer);
          assert.equal(
            deployerBalance.toString(),
            ethers.utils.parseUnits("100", 6).toString()
          );
        });

        it("doesnt withdraw if user has no fund", async () => {
          await dca.deposit(50);

          const signer = await ethers.getSigner(user);
          const conectedUserDca = await dca.connect(signer);

          await conectedUserDca.withdraw();

          const dcaBalance = await usdc.balanceOf(dca.address);
          assert.equal(dcaBalance.toString(), ethers.utils.parseUnits("50", 6));
        });
      });
    });
