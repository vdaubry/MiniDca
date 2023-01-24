const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { mintUsdc } = require("../../utils/mintUsdc");
const { getUSDC, getWETH, getDAI, getWBTC } = require("../../utils/tokens");
const { prepareUpkeep } = require("../utils");

const depositForUser = async (
  userDeposit,
  userBuy,
  user,
  dca,
  usdc,
  tokenToBuy
) => {
  const signer = await ethers.getSigner(user);
  const connectedUserDca = await dca.connect(signer);
  const connectedUserUsdc = await usdc.connect(signer);
  const amount = ethers.utils.parseUnits("1000", 6);
  await mintUsdc(user, amount);
  await connectedUserUsdc.approve(dca.address, ethers.constants.MaxInt256);
  await connectedUserDca.deposit(userDeposit, tokenToBuy, userBuy, 1);
  return connectedUserDca;
};

if (!developmentChains.includes(network.name)) {
  describe.skip;
} else {
  describe("dca integration", () => {
    let deployer, user, dca, interval, usdc, weth, dai, actual_amount_minted;
    const BUY_INTERVAL = 1; // 1 second

    beforeEach(async () => {
      await deployments.fixture(["all"]);
      deployer = (await getNamedAccounts()).deployer;
      user = (await getNamedAccounts()).user;
      dca = await ethers.getContract("Dca", deployer);

      usdc = await getUSDC(deployer);
      weth = await getWETH(deployer);
      wbtc = await getWBTC(deployer);
      dai = await getDAI(deployer);

      interval = await dca.getKeepersUpdateInterval();

      const amount = ethers.utils.parseUnits("1000", 6);
      actual_amount_minted = await mintUsdc(deployer, amount);

      await usdc.approve(dca.address, ethers.constants.MaxInt256);
    });

    describe("single investor multiple deposit and withdraw", () => {
      it("should allow multiple deposit and withdraw for single investor", async () => {
        await dca.deposit(100, weth.address, 10, BUY_INTERVAL);
        await dca.withdraw();
        await dca.deposit(200, wbtc.address, 1, BUY_INTERVAL);

        const amountInvestedDeployer = await dca.getAmountInvestedForAddress(
          deployer
        );
        assert.equal(
          amountInvestedDeployer.toString(),
          ethers.utils.parseUnits("200", 6).toString()
        );
      });
    });

    describe("Multiple investors deposit and withdraw", () => {
      it("should allow multiple deposit and withdraw for multiple investors", async () => {
        await dca.deposit(100, weth.address, 1, BUY_INTERVAL);
        await dca.withdraw();
        const connectedUserDca = await depositForUser(
          200,
          2,
          user,
          dca,
          usdc,
          dai.address
        );

        const tokenToBuy = await connectedUserDca.getTokenToBuyForAddress(user);
        assert.equal(tokenToBuy.toString(), dai.address);

        const amountToBuy = await connectedUserDca.getAmountToBuyForAddress(
          user
        );
        assert.equal(ethers.utils.formatUnits(amountToBuy, 6), 2);
      });
    });

    describe("Multiple investors swaps assets", () => {
      it("swaps assets for multiple investors", async () => {
        const deployerBuy = 10;
        const deployerDeposit = 50;
        await dca.deposit(
          deployerDeposit,
          weth.address,
          deployerBuy,
          BUY_INTERVAL
        );

        const userBuy = 20;
        const userDeposit = 50;
        await depositForUser(
          userDeposit,
          userBuy,
          user,
          dca,
          usdc,
          dai.address
        );

        await prepareUpkeep(interval);

        await dca.performUpkeep([]);

        const finalDcaUsdcBalance = await usdc.balanceOf(dca.address);
        assert.equal(
          finalDcaUsdcBalance.toString(),
          ethers.utils
            .parseUnits(
              (
                userDeposit +
                deployerDeposit -
                (userBuy + deployerBuy)
              ).toString(),
              6
            )
            .toString()
        );

        const finalDcaWethBalance = await weth.balanceOf(deployer);
        assert.isAbove(finalDcaWethBalance, 0);

        const finalDcaDaiBalance = await dai.balanceOf(user);
        assert.isAbove(finalDcaDaiBalance, 0);
      });
    });
  });
}
