import AppHeader from "../components/AppHeader";
import Funding from "../components/Funding";
import Withdrawing from "../components/Withdrawing";
import { useWeb3Contract, useMoralis } from "react-moralis";
import CurrentInvestment from "../components/CurrentInvestment";
import ApproveToken from "../components/ApproveToken";
import { useEffect, useState } from "react";
import { usdcAbi, contractAddresses } from "../constants";

export default function DcaApp() {
  const { chainId: chainIdHex, account, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const dcaAddress =
    chainIdHex && contractAddresses[chainId]
      ? contractAddresses[chainId]["dca"]
      : null;
  const usdcAddress =
    chainIdHex && contractAddresses[chainId]
      ? contractAddresses[chainId]["usdc"]
      : null;
  const [shouldReloadUI, setShouldReloadUI] = useState(false);
  const [isUsdcApproved, setIsUsdcApproved] = useState(false);

  /**************************************
   *
   * Smart contract function calls
   *
   **************************************/

  const { runContractFunction: allowance } = useWeb3Contract({
    abi: usdcAbi,
    contractAddress: usdcAddress,
    functionName: "allowance",
    params: { owner: account, spender: dcaAddress },
  });

  /**************************************
   *
   * Render UI
   *
   **************************************/

  const onChangeBalance = () => {
    setShouldReloadUI(true);
  };

  async function updateUIValues() {
    const usdcAllowance = await allowance();
    if (usdcAllowance == undefined) {
      setShouldReloadUI(true);
    } else {
      setIsUsdcApproved(usdcAllowance > 0);
    }
  }

  useEffect(() => {
    if (shouldReloadUI) {
      setShouldReloadUI(false);
    }
    updateUIValues();
  }, [shouldReloadUI, isUsdcApproved]);

  return (
    <div>
      <AppHeader />
      <CurrentInvestment
        dcaAddress={dcaAddress}
        shouldReloadUI={shouldReloadUI}
      />

      {isUsdcApproved ? (
        <div>
          <Funding
            dcaAddress={dcaAddress}
            usdcAddress={usdcAddress}
            onChangeBalance={onChangeBalance}
          />
          <Withdrawing
            dcaAddress={dcaAddress}
            onChangeBalance={onChangeBalance}
          />
        </div>
      ) : (
        <ApproveToken
          dcaAddress={dcaAddress}
          usdcAddress={usdcAddress}
        ></ApproveToken>
      )}
    </div>
  );
}
