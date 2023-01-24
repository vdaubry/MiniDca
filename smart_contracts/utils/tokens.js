const { networkConfig } = require("../helper-hardhat-config");

const getTokenContract = (tokenAddress, deployer) => {
  return ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
    tokenAddress,
    deployer
  );
};

const getUSDC = (deployer) => {
  const usdcTokenAddress = networkConfig[network.config.chainId].usdcToken;
  return getTokenContract(usdcTokenAddress, deployer);
};

const getWETH = (deployer) => {
  const wethTokenAddress = networkConfig[network.config.chainId].wethToken;
  return getTokenContract(wethTokenAddress, deployer);
};

const getWBTC = (deployer) => {
  const wbtcTokenAddress = networkConfig[network.config.chainId].wbtcToken;
  return getTokenContract(wbtcTokenAddress, deployer);
};

const getDAI = (deployer) => {
  const daiTokenAddress = networkConfig[network.config.chainId].daiToken;
  return getTokenContract(daiTokenAddress, deployer);
};

module.exports = { getUSDC, getWETH, getWBTC, getDAI };
