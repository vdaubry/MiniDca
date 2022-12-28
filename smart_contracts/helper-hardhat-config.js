const networkConfig = {
  default: {
    name: "hardhat",
  },
  31337: {
    name: "localhost",
    wethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    daiToken: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    usdcToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    swapFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  },
  5: {
    name: "goerli",
    wethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    daiToken: "0x6b175474e89094c44da98b954eedeac495271d0f",
    usdcToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    swapFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  },
  1: {
    name: "mainnet",
  },
};

const developmentChains = ["hardhat", "localhost"];
const VERIFICATION_BLOCK_CONFIRMATIONS = 6;

module.exports = {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
};
