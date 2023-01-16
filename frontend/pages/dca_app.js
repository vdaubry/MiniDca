import AppHeader from "../components/AppHeader";
import Funding from "../components/Funding";
import Withdrawing from "../components/Withdrawing";
import CurrentInvestment from "../components/CurrentInvestment";
import ApproveToken from "../components/ApproveToken";
import { useEffect, useState } from "react";
import { usdcAbi, contractAddresses } from "../constants";
import { useNetwork, useAccount, useContractRead } from "wagmi";

export default function DcaApp() {
  const { chain } = useNetwork();
  const { address: account, isConnected } = useAccount();

  const [shouldReloadUI, setShouldReloadUI] = useState(false);
  const [isUsdcApproved, setIsUsdcApproved] = useState(false);

  let dcaAddress, usdcAddress, wethAddress, wbtcAddress, wmaticAddress;
  if (chain && contractAddresses[chain.id]) {
    const chainId = chain.id;
    dcaAddress = contractAddresses[chainId]["dca"];
    usdcAddress = contractAddresses[chainId]["usdc"];
    wethAddress = contractAddresses[chainId]["weth"];
    wbtcAddress = contractAddresses[chainId]["wbtc"];
    wmaticAddress = contractAddresses[chainId]["wmatic"];
  }

  /**************************************
   *
   * Smart contract function calls
   *
   **************************************/

  const { data: usdcAllowance } = useContractRead({
    address: usdcAddress,
    abi: usdcAbi,
    functionName: "allowance",
    args: [account, dcaAddress],
  });

  // const { runContractFunction: allowance } = useWeb3Contract({
  //   abi: usdcAbi,
  //   contractAddress: usdcAddress,
  //   functionName: "allowance",
  //   params: { owner: account, spender: dcaAddress },
  // });
  // /**************************************
  //  *
  //  * Render UI
  //  *
  //  **************************************/
  // const onChangeBalance = () => {
  //   setShouldReloadUI(true);
  // };
  // async function updateUIValues() {
  //   const usdcAllowance = await allowance();
  //   if (usdcAllowance == undefined) {
  //     setShouldReloadUI(true);
  //   } else {
  //     setIsUsdcApproved(usdcAllowance > 0);
  //   }
  // }
  // useEffect(() => {
  //   if (shouldReloadUI) {
  //     setShouldReloadUI(false);
  //   }
  //   updateUIValues();
  // }, [shouldReloadUI, isUsdcApproved]);
  return (
    <div>
      <AppHeader />
      <CurrentInvestment
        dcaAddress={dcaAddress}
        usdcAddress={usdcAddress}
        shouldReloadUI={shouldReloadUI}
      />
      {usdcAllowance > 0 ? (
        <div>
          {/* <Funding
            dcaAddress={dcaAddress}
            usdcAddress={usdcAddress}
            wethAddress={wethAddress}
            wbtcAddress={wbtcAddress}
            wmaticAddress={wmaticAddress}
            onChangeBalance={onChangeBalance}
          />
          <Withdrawing
            dcaAddress={dcaAddress}
            onChangeBalance={onChangeBalance}
          /> */}
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
