const { ethers, getNamedAccounts, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
require("dotenv").config();

const AMOUNT = ethers.utils.parseEther("0.1");

async function main() {
  const { deployer } = await getNamedAccounts();

  const simpleSwap = await ethers.getContractAt("SimpleSwap", deployer);

  const swapTx = await simpleSwap.swapWETHForDAI(AMOUNT);
  const receipt = await swapTx.wait(1);
  const logs = receipt.logs;

  let amountOut;
  for (const log of logs) {
    // Decode the log using the ABI of the contract
    const decodedLog = simpleSwap.interface.parseLog(log);
    if (decodedLog.name === "SwappedFor") {
      amountOut = decodedLog.values.amountOut;
      break;
    }
  }

  console.log(`Swapped ${AMOUNT} WETH for ${amountOut} DAI`);

  // const usdc = await ethers.getContractAt(
  //   "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
  //   networkConfig[network.config.chainId].usdcToken,
  //   deployer
  // );

  // const usdcBalance = await usdc.balanceOf(walletAddress);
  // console.log(`Got ${usdcBalance.toString()} USDC`);

  //console.log(`Swapped ${AMOUNT} WETH9 for ${amountOut.toString()} DAI`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// const {
//   abi: IUniswapV3PoolABI,
// } = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
// const {
//   abi: QuoterABI,
// } = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");
// require("dotenv").config();

// const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
// const PRIVATE_KEY = process.env.PRIVATE_KEY;
// const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

// const provider = new ethers.providers.JsonRpcProvider(INFURA_URL);

// //0x99ac8ca7087fa4a2a1fb6357269965a2014abc35 // WBTC / USDC
// const poolAddress = "0xcbcdf9626bc03e24f779434178a73a0b4bad62ed"; // WBTC / ETH
