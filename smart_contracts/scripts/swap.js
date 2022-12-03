const { ethers } = require("ethers");
const {
  abi: IUniswapV3PoolABI,
} = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
const {
  abi: QuoterABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");
require("dotenv").config();

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const provider = new ethers.providers.JsonRpcProvider(INFURA_URL);

//0x99ac8ca7087fa4a2a1fb6357269965a2014abc35 // WBTC / USDC
const poolAddress = "0xcbcdf9626bc03e24f779434178a73a0b4bad62ed"; // WBTC / ETH
