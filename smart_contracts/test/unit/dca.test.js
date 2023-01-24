const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { mintUsdc } = require("../../utils/mintUsdc");
const { getUSDC, getWETH, getDAI } = require("../../utils/tokens");
const { prepareUpkeep } = require("../utils");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("dca", () => {
      let deployer, user, dca, interval, usdc, weth, dai, actual_amount_minted;
      const BUY_INTERVAL = 1; // 1 second

      beforeEach(async () => {
        await deployments.fixture(["all"]);
        deployer = (await getNamedAccounts()).deployer;
        user = (await getNamedAccounts()).user;
        dca = await ethers.getContract("Dca", deployer);

        usdc = await getUSDC(deployer);
        weth = await getWETH(deployer);
        dai = await getDAI(deployer);

        interval = await dca.getKeepersUpdateInterval();

        const amount = ethers.utils.parseUnits("1000", 6);
        actual_amount_minted = await mintUsdc(deployer, amount);

        await usdc.approve(dca.address, ethers.constants.MaxInt256);
      });

      describe("deposit", () => {
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

          const amountToBuy = await dca.getAmountToBuyForAddress(deployer);
          assert.equal(ethers.utils.formatUnits(amountToBuy, 6), 10);
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

        it("adds depositor to investor list", async () => {
          await dca.deposit(50, weth.address, 10, BUY_INTERVAL);

          const isInvestor = await dca.isInvestor(deployer);
          assert.equal(isInvestor, true);
        });

        it("updates investor infos on second deposit", async () => {
          await dca.deposit(50, weth.address, 10, BUY_INTERVAL);
          await dca.deposit(50, dai.address, 20, 2);

          const amountInvestedDeployer = await dca.getAmountInvestedForAddress(
            deployer
          );
          assert.equal(
            amountInvestedDeployer.toString(),
            ethers.utils.parseUnits("100", 6).toString()
          );

          const investors = await dca.getInvestors();
          expect(investors.map((ad) => ad.toUpperCase())).to.eql([
            deployer.toUpperCase(),
          ]);

          const tokenToBuy = await dca.getTokenToBuyForAddress(deployer);
          assert.equal(tokenToBuy.toString(), dai.address);

          const buyInterval = await dca.getBuyIntervalForAddress(deployer);
          assert.equal(buyInterval, 2);

          const amountToBuy = await dca.getAmountToBuyForAddress(deployer);
          assert.equal(ethers.utils.formatUnits(amountToBuy, 6), 20);
        });
      });

      describe("withdraw", () => {
        it("returns tokens to sender", async () => {
          await dca.deposit(50, weth.address, 10, BUY_INTERVAL);

          await dca.withdraw();

          const amountInvestedDeployer = await dca.getAmountInvestedForAddress(
            deployer
          );
          assert.equal(amountInvestedDeployer.toString(), "0");

          const dcaBalance = await usdc.balanceOf(dca.address);
          assert.equal(dcaBalance.toString(), "0");

          const deployerBalance = await usdc.balanceOf(deployer);
          assert.equal(
            ethers.utils.formatUnits(deployerBalance.toString(), 6),
            actual_amount_minted.toString()
          );
        });

        it("doesnt withdraw if user has no fund", async () => {
          await dca.deposit(50, weth.address, 10, BUY_INTERVAL);

          const signer = await ethers.getSigner(user);
          const connectedUserDca = await dca.connect(signer);

          await expect(
            connectedUserDca.withdraw()
          ).to.be.revertedWithCustomError(
            connectedUserDca,
            "Dca__WithdrawError"
          );

          const dcaBalance = await usdc.balanceOf(dca.address);
          assert.equal(dcaBalance.toString(), ethers.utils.parseUnits("50", 6));
        });

        it("removes users from investors list", async () => {
          await dca.deposit(50, weth.address, 10, BUY_INTERVAL);

          await dca.withdraw();

          const isInvestor = await dca.isInvestor(deployer);
          assert.equal(isInvestor, false);
        });

        it("removes users from investor config mapping", async () => {
          await dca.deposit(50, weth.address, 10, BUY_INTERVAL);

          await dca.withdraw();

          const investorConfig = await dca.getInvestorConfig(deployer);
          assert.equal(investorConfig.exists, false);
          assert.equal(investorConfig.index, 0);
        });
      });

      describe("checkUpKeep", () => {
        it("returns true if interval has passed", async () => {
          await prepareUpkeep(interval);

          const { upkeepNeeded } = await dca.callStatic.checkUpkeep([]);

          assert.equal(upkeepNeeded.toString(), "true");
        });

        it("returns false if interval has not passed", async () => {
          await dca.deposit(50, weth.address, 10, BUY_INTERVAL);

          const { upkeepNeeded } = await dca.callStatic.checkUpkeep([]);

          assert.equal(upkeepNeeded.toString(), "false");
        });
      });

      describe("performUpkeep", () => {
        it("swaps assets", async () => {
          await dca.deposit(50, weth.address, 10, BUY_INTERVAL);

          const initialDcaUsdcBalance = await usdc.balanceOf(dca.address);
          assert.equal(
            initialDcaUsdcBalance.toString(),
            ethers.utils.parseUnits("50", 6)
          );

          const initialDcaWethBalance = await weth.balanceOf(deployer);
          assert.equal(initialDcaWethBalance.toString(), "0");

          await prepareUpkeep(interval);

          await dca.performUpkeep([]);

          const finalDcaUsdcBalance = await usdc.balanceOf(dca.address);
          assert.equal(
            finalDcaUsdcBalance.toString(),
            ethers.utils.parseUnits("40", 6).toString()
          );

          const finalDcaWethBalance = await weth.balanceOf(deployer);
          assert.isAbove(finalDcaWethBalance, 0);
        });

        it("fails if interval has not passed", async () => {
          await expect(dca.performUpkeep([])).to.be.revertedWithCustomError(
            dca,
            "Dca__UpkeepNotNeeded"
          );
        });

        it("swaps remaining amount if user has less amount deposited than amount to buy", async () => {
          await dca.deposit(50, weth.address, 100, BUY_INTERVAL);

          await prepareUpkeep(interval);

          await dca.performUpkeep([]);

          const finalDcaUsdcBalance = await usdc.balanceOf(dca.address);
          assert.equal(finalDcaUsdcBalance.toString(), "0");

          const finalDcaWethBalance = await weth.balanceOf(deployer);
          assert.isAbove(finalDcaWethBalance, 0);
        });
      });
    });
