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
        it.only("should return the correct price", async () => {
          const amountIn = ethers.utils.parseUnits("100", 6);
          const amountOut = ethers.utils.parseUnits("1", 18);

          const price = await simpleSwap.getTokenBPriceInTokenA(
            usdc.address,
            dai.address,
            amountIn
          );

          assert.equal(price.toString(), amountOut.toString());
        });
      });
    });
