import { mainnet, polygon, arbitrum, hardhat } from "wagmi/chains";
import { getDefaultClient } from "connectkit";
import { createClient } from "wagmi";

const chains = [mainnet, polygon, arbitrum, hardhat];

export const client = createClient(
  getDefaultClient({
    autoConnect: true,
    appName: "MiniDCA",
    chains,
  })
);
