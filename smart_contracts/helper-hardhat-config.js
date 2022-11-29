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

const USDC_TESTNET_ABI = [
  { type: "constructor", payable: false, inputs: [] },
  {
    type: "event",
    anonymous: false,
    name: "Approval",
    inputs: [
      { type: "address", name: "owner", indexed: true },
      { type: "address", name: "spender", indexed: true },
      { type: "uint256", name: "value", indexed: false },
    ],
  },
  {
    type: "event",
    anonymous: false,
    name: "OwnershipTransferred",
    inputs: [
      { type: "address", name: "previousOwner", indexed: true },
      { type: "address", name: "newOwner", indexed: true },
    ],
  },
  {
    type: "event",
    anonymous: false,
    name: "Transfer",
    inputs: [
      { type: "address", name: "from", indexed: true },
      { type: "address", name: "to", indexed: true },
      { type: "uint256", name: "value", indexed: false },
    ],
  },
  {
    type: "function",
    name: "allowance",
    constant: true,
    stateMutability: "view",
    payable: false,
    gas: 29000000,
    inputs: [
      { type: "address", name: "owner" },
      { type: "address", name: "spender" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    constant: false,
    payable: false,
    gas: 29000000,
    inputs: [
      { type: "address", name: "spender" },
      { type: "uint256", name: "amount" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    constant: true,
    stateMutability: "view",
    payable: false,
    gas: 29000000,
    inputs: [{ type: "address", name: "account" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    constant: true,
    stateMutability: "view",
    payable: false,
    gas: 29000000,
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "decreaseAllowance",
    constant: false,
    payable: false,
    gas: 29000000,
    inputs: [
      { type: "address", name: "spender" },
      { type: "uint256", name: "subtractedValue" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "increaseAllowance",
    constant: false,
    payable: false,
    gas: 29000000,
    inputs: [
      { type: "address", name: "spender" },
      { type: "uint256", name: "addedValue" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "mint",
    constant: false,
    payable: false,
    gas: 29000000,
    inputs: [
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "name",
    constant: true,
    stateMutability: "view",
    payable: false,
    gas: 29000000,
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "owner",
    constant: true,
    stateMutability: "view",
    payable: false,
    gas: 29000000,
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "renounceOwnership",
    constant: false,
    payable: false,
    gas: 29000000,
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "symbol",
    constant: true,
    stateMutability: "view",
    payable: false,
    gas: 29000000,
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "totalSupply",
    constant: true,
    stateMutability: "view",
    payable: false,
    gas: 29000000,
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "transfer",
    constant: false,
    payable: false,
    gas: 29000000,
    inputs: [
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "transferFrom",
    constant: false,
    payable: false,
    gas: 29000000,
    inputs: [
      { type: "address", name: "from" },
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "transferOwnership",
    constant: false,
    payable: false,
    gas: 29000000,
    inputs: [{ type: "address", name: "newOwner" }],
    outputs: [],
  },
];

module.exports = {
  networkConfig,
  developmentChains,
  USDC_CONTRACT_ADRESSES,
  USDC_TESTNET_ABI,
  VERIFICATION_BLOCK_CONFIRMATIONS,
};
