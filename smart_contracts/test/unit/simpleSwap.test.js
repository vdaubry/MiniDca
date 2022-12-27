const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { getUSDC, getWETH, getDAI } = require("../../utils/tokens");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("simpleSwap", () => {
      let deployer, usdc, weth, dai, simpleSwap;

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
          const amountOut = ethers.utils.parseUnits("0.000823", 6);

          const price = await simpleSwap.getTokenAPriceInTokenB(
            usdc.address,
            weth.address
          );

          assert.equal(price.toString(), amountOut.toString());
        });

        it("should return the correct price for DAI in USDC", async () => {
          const amountOut = ethers.utils.parseUnits("0.997585", 6);

          const price = await simpleSwap.getTokenAPriceInTokenB(
            usdc.address,
            dai.address
          );

          assert.equal(price.toString(), amountOut.toString());
        });
      });
    });
