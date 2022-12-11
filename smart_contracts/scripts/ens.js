const { Alchemy, Network } = require("alchemy-sdk");
require("dotenv").config();

async function main() {
  const config = {
    apiKey: process.env.MAINET_ALCHEMY_KEY,
    network: Network.ETH_MAINNET,
  };
  const alchemy = new Alchemy(config);

  const walletAddress = "0xCe2289B87b80457AC7f07352b25D2576BD6D88D8";
  const ensContractAddress = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85";
  const nfts = await alchemy.nft.getNftsForOwner(walletAddress, {
    contractAddresses: [ensContractAddress],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
