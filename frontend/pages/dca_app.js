import AppHeader from "../components/AppHeader";
import Funding from "../components/Funding";
import Withdrawing from "../components/Withdrawing";
import { useMoralis } from "react-moralis";
import CurrentInvestment from "../components/CurrentInvestment";
import { useEffect, useState } from "react";
import { abi, contractAddresses } from "../constants";

export default function DcaApp() {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const dcaAddress =
    chainIdHex && contractAddresses[chainId]
      ? contractAddresses[chainId]["dca"]
      : null;
  const [shouldReloadUI, setShouldReloadUI] = useState(false);

  /**************************************
   *
   * Render UI
   *
   **************************************/

  const onChangeBalance = () => {
    setShouldReloadUI(true);
  };

  async function updateUIValues() {}

  useEffect(() => {
    if (shouldReloadUI) {
      setShouldReloadUI(false);
    }
  }, [shouldReloadUI]);

  return (
    <div>
      <AppHeader />
      <CurrentInvestment
        dcaAddress={dcaAddress}
        shouldReloadUI={shouldReloadUI}
      />
      <Funding dcaAddress={dcaAddress} onChangeBalance={onChangeBalance} />
      <Withdrawing dcaAddress={dcaAddress} onChangeBalance={onChangeBalance} />
    </div>
  );
}
