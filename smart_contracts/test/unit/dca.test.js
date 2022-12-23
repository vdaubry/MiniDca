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
      let deployer, user, dca, interval, usdc, weth, actual_amount_minted;
      const BUY_INTERVAL = 1; // 1 second

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

        const amount = ethers.utils.parseUnits("1000", 6);
        actual_amount_minted = await mintUsdc(deployer, amount);

        await usdc.approve(dca.address, ethers.constants.MaxInt256);
      });

      describe("deposit", () => {
        //TODO: Add test for the case where an investor deposit more than once with different configurations

        it("sets deposited amount", async () => {
          await dca.deposit(50, weth.address, 10, BUY_INTERVAL);

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
            ethers.utils.formatUnits(startDeployerBalance, 6),
            actual_amount_minted
          );

          await dca.deposit(50, weth.address, 10, BUY_INTERVAL);

          const finalDeployerBalance = await usdc.balanceOf(deployer);
          assert.equal(
            ethers.utils.formatUnits(finalDeployerBalance, 6),
            actual_amount_minted - 50
          );

          const finalDcaBalance = await usdc.balanceOf(dca.address);
          assert.equal(ethers.utils.formatUnits(finalDcaBalance, 6), 50.0);
        });

        it("sets invest config", async () => {
          await dca.deposit(50, weth.address, 10, BUY_INTERVAL);

          const tokenToBuy = await dca.getTokenToBuyForAddress(deployer);
          assert.equal(tokenToBuy.toString(), weth.address);

          const buyInterval = await dca.getBuyIntervalForAddress(deployer);
          assert.equal(buyInterval.toString(), BUY_INTERVAL);

          const amountToBuy = await dca.getAmounToBuyForAddress(deployer);
          assert.equal(ethers.utils.formatUnits(amountToBuy, 18), 10);
        });

        it("sets nextBuyTimestamp", async () => {
          await dca.deposit(50, weth.address, 10, BUY_INTERVAL);

          const block = await ethers.provider.send("eth_getBlockByNumber", [
            "latest",
            false,
          ]);
          const timestamp = parseInt(block.timestamp, 16);

          const nextBuyTimestamp = await dca.getNextBuyTimestampForAddress(
            deployer
          );
          assert.equal(nextBuyTimestamp, (timestamp + BUY_INTERVAL).toString());
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
        it("swaps assets", async () => {
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
