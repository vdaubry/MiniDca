import { mainnet, polygon, arbitrum, hardhat, goerli } from "wagmi/chains";
import { getDefaultClient } from "connectkit";
import { createClient } from "wagmi";

const chains = [mainnet, polygon, arbitrum, goerli, hardhat];

export const client = createClient(
  getDefaultClient({
    autoConnect: true,
    appName: "MiniDCA",
    chains,
  })
);
