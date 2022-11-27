import AppHeader from "../components/AppHeader";
import Funding from "../components/Funding";
import Withdrawing from "../components/Withdrawing";
import { useMoralis } from "react-moralis";
import CurrentInvestment from "../components/CurrentInvestment";
import { useEffect, useState } from "react";
import { abi, contractAddresses } from "../constants";

export default function DcaApp() {
  const { chainId: chainIdHex, account, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const dcaAddress =
    chainIdHex && contractAddresses[chainId]
      ? contractAddresses[chainId]["dca"]
      : null;

  /**************************************
   *
   * Render UI
   *
   **************************************/

  async function updateUIValues() {}

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUIValues();
    }
  }, [isWeb3Enabled]);

  return (
    <div>
      <AppHeader />
      <CurrentInvestment dcaAddress={dcaAddress} />
      <Funding />
      <Withdrawing />
    </div>
  );
}
