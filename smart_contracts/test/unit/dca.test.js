const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("dca", () => {
      let deployer;
      let user;
      let dca;

      describe("deposit", () => {
        beforeEach(async () => {
          await deployments.fixture(["all"]);
          deployer = (await getNamedAccounts()).deployer;
          user = (await getNamedAccounts()).user;
          dca = await ethers.getContract("Dca", deployer);
          usdc = await ethers.getContract("Usdc", deployer);

          const mintTx = await usdc.mint(
            deployer,
            ethers.utils.parseEther("100")
          );
          await mintTx.wait(1);
        });

        it("sets deposited amount", async () => {
          dca.deposit({
            depositAmount: "50",
          });

          const amountInvestedDeployer = await dca.getAmountInvestedForAddress(
            deployer
          );
          assert(
            ethers.utils.formatEther(amountInvestedDeployer.toString()),
            "50"
          );

          const amountInvestedUser = await dca.getAmountInvestedForAddress(
            user
          );
          assert(amountInvestedUser.toString(), "0");
        });

        it("transfers funds from user to contract", async () => {
          const startDeployerBalance = await usdc.balanceOf(deployer);
          assert(startDeployerBalance.toString(), "100");

          dca.deposit({
            depositAmount: "50",
          });

          const finalDeployerBalance = await usdc.balanceOf(deployer);
          assert(finalDeployerBalance.toString(), "50");

          const dcaBalance = await usdc.balanceOf(dca.address);
          assert(dcaBalance.toString(), "50");
        });
      });

      describe("withdraw", () => {
        it("returns tokens to sender", async () => {
          dca.deposit({
            depositAmount: "50",
          });

          await dca.withdraw();

          const amountInvestedDeployer = await dca.getAmountInvestedForAddress(
            deployer
          );
          assert(amountInvestedDeployer.toString(), "0");

          const dcaBalance = await usdc.balanceOf(dca.address);
          assert(dcaBalance.toString(), "0");

          const deployerBalance = await usdc.balanceOf(deployer);
          assert(dcaBalance.toString(), "100");
        });

        it("doesnt withdraw if user has no fund", async () => {
          dca.deposit({
            depositAmount: "50",
          });

          const signer = await ethers.getSigner(user);
          const conectedUserDca = await dca.connect(signer);

          await conectedUserDca.withdraw();

          const dcaBalance = await usdc.balanceOf(dca.address);
          assert(ethers.utils.parseEther(dcaBalance.toString()), "50");
        });
      });
    });
