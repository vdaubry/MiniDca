const networkConfig = {
  default: {
    name: "hardhat",
  },
  31337: {
    name: "localhost",
  },
  5: {
    name: "goerli",
  },
  1: {
    name: "mainnet",
  },
};

const developmentChains = ["hardhat", "localhost"];
const VERIFICATION_BLOCK_CONFIRMATIONS = 6;
const USDC_CONTRACT_ADRESSES = {
  5: {
    address: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
  },
  1: {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
};

module.exports = {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
};
