const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

describe("dca", () => {
  let deployer;
  let user;
  let dca;

  describe("fund", () => {
    beforeEach(async () => {
      await deployments.fixture(["all"]);
      deployer = (await getNamedAccounts()).deployer;
      user = (await getNamedAccounts()).user;
      dca = await ethers.getContract("Dca", deployer);
    });

    it("sets invested amount", async () => {
      dca.fund({
        value: ethers.utils.parseEther("0.1"),
      });

      const amountInvestedDeployer = await dca.getAmountInvestedForAddress(
        deployer
      );
      assert(
        ethers.utils.formatEther(amountInvestedDeployer.toString()),
        "0.1"
      );

      const amountInvestedUser = await dca.getAmountInvestedForAddress(user);
      assert(amountInvestedUser.toString(), "0");
    });
  });

  describe("withdraw", () => {
    it("returns funds to sender", async () => {
      dca.fund({
        value: ethers.utils.parseEther("0.2"),
      });

      await dca.withdraw();

      const amountInvestedDeployer = await dca.getAmountInvestedForAddress(
        deployer
      );
      assert(amountInvestedDeployer.toString(), "0");

      const dcaBalance = await ethers.provider.getBalance(dca.address);
      assert(dcaBalance.toString(), "0");
    });

    it("doesnt withdraw if user has no fund", async () => {
      dca.fund({
        value: ethers.utils.parseEther("0.2"),
      });

      const signer = await ethers.getSigner(user);
      const conectedUserDca = await dca.connect(signer);

      await conectedUserDca.withdraw();

      const dcaBalance = await ethers.provider.getBalance(dca.address);
      assert(ethers.utils.parseEther(dcaBalance.toString()), "0.2");
    });
  });
});
