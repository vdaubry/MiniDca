const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { getUSDC, getWETH, getDAI } = require("../../utils/tokens");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("simpleSwap", () => {
      let deployer, usdc, weth, dai, simpleSwap;
      const MAX_SLIPPAGE_BPS = 5;

      beforeEach(async () => {
        await deployments.fixture(["all"]);
        deployer = (await getNamedAccounts()).deployer;

        simpleSwap = await ethers.getContract("SimpleSwap", deployer);

        usdc = await getUSDC(deployer);
        weth = await getWETH(deployer);
        dai = await getDAI(deployer);
      });

      describe("getTokenBPriceInTokenA", async () => {
        it("should return the correct price for 1 WETH in USDC", async () => {
          const amountOut = ethers.utils.parseUnits("1214.980139", 6);

          const price = await simpleSwap.getTokenBPriceInTokenA(
            usdc.address,
            weth.address
          );

          assert.equal(price.toString(), amountOut.toString());
        });

        it("should return the correct price for 1 DAI in USDC", async () => {
          const amountOut = ethers.utils.parseUnits("1.002420", 6);

          const price = await simpleSwap.getTokenBPriceInTokenA(
            usdc.address,
            dai.address
          );

          assert.equal(price.toString(), amountOut.toString());
        });
      });

      describe("getTokenAPriceInTokenB", async () => {
        it("should return the correct price for 1 USDC in WETH", async () => {
          const amountOut = ethers.utils.parseUnits("0.000823", 18);

          const price = await simpleSwap.getTokenAPriceInTokenB(
            usdc.address,
            weth.address
          );

          assert.equal(price.toString(), amountOut.toString());
        });

        it("should return the correct price for DAI in USDC", async () => {
          const amountOut = ethers.utils.parseUnits("0.997585", 18);

          const price = await simpleSwap.getTokenAPriceInTokenB(
            usdc.address,
            dai.address
          );

          assert.equal(price.toString(), amountOut.toString());
        });
      });

      describe("getMinAmountOut", async () => {
        it("should return the correct minimum amount out for 1 USDC in WETH", async () => {
          const USDCAmount = 1000;
          const USDC_PRICE_ETH = 0.000823;
          const amountIn = ethers.utils.parseUnits(USDCAmount.toString(), 6);

          const amountOut = ethers.utils.parseUnits(
            (
              USDCAmount *
              USDC_PRICE_ETH *
              (1 - MAX_SLIPPAGE_BPS / 1000)
            ).toString(),
            18
          );

          const minAmountOut = await simpleSwap.getMinAmountOut(
            amountIn,
            usdc.address,
            weth.address,
            MAX_SLIPPAGE_BPS
          );

          assert.equal(minAmountOut.toString(), amountOut.toString());
        });
      });
    });
