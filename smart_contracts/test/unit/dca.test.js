const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");
const { mintUsdc } = require("../../utils/mintUsdc");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("dca", () => {
      let deployer, user, dca, interval, usdc, weth;

      beforeEach(async () => {
        await deployments.fixture(["all"]);
        deployer = (await getNamedAccounts()).deployer;
        user = (await getNamedAccounts()).user;
        dca = await ethers.getContract("Dca", deployer);

        const usdcTokenAddress =
          networkConfig[network.config.chainId].usdcToken;
        usdc = await ethers.getContractAt(
          "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
          usdcTokenAddress,
          deployer
        );

        const wethTokenAddress =
          networkConfig[network.config.chainId].wethToken;
        weth = await ethers.getContractAt(
          "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
          wethTokenAddress,
          deployer
        );

        interval = await dca.getKeepersUpdateInterval();

        await mintUsdc(deployer);

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

          await expect(
            conectedUserDca.withdraw()
          ).to.be.revertedWithCustomError(
            conectedUserDca,
            "Dca__WithdrawError"
          );

          const dcaBalance = await usdc.balanceOf(dca.address);
          assert.equal(dcaBalance.toString(), ethers.utils.parseUnits("50", 6));
        });
      });

      const prepareUpkeep = async () => {
        await ethers.provider.send("evm_increaseTime", [interval.toNumber()]);
        await network.provider.send("evm_mine", []);
      };

      describe("checkUpKeep", () => {
        it("returns true if interval has passed", async () => {
          await prepareUpkeep();

          const { upkeepNeeded } = await dca.callStatic.checkUpkeep([]);

          assert.equal(upkeepNeeded.toString(), "true");
        });

        it("returns false if interval has not passed", async () => {
          await dca.deposit(50);

          const { upkeepNeeded } = await dca.callStatic.checkUpkeep([]);

          assert.equal(upkeepNeeded.toString(), "false");
        });
      });

      describe("performUpkeep", () => {
        it.only("swaps assets", async () => {
          await dca.deposit(150);

          const initialDcaUsdcBalance = await usdc.balanceOf(dca.address);
          assert.equal(
            initialDcaUsdcBalance.toString(),
            ethers.utils.parseUnits("150", 6)
          );

          const initialDcaWethBalance = await weth.balanceOf(dca.address);
          assert.equal(initialDcaWethBalance.toString(), "0");

          await prepareUpkeep();

          await dca.performUpkeep([]);

          const finalDcaUsdcBalance = await usdc.balanceOf(dca.address);
          assert.equal(
            finalDcaUsdcBalance.toString(),
            ethers.utils.parseUnits("50", 6)
          );

          const finalDcaWethBalance = await usdc.balanceOf(weth.address);
          assert.isAbove(finalDcaWethBalance, 0);
        });

        it("fails if interval has not passed", async () => {
          await expect(dca.performUpkeep([])).to.be.revertedWithCustomError(
            dca,
            "Dca__UpkeepNotNeeded"
          );
        });
      });
    });
