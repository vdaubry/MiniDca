import { useWeb3Contract } from "react-moralis";
import { useMoralis } from "react-moralis";
import { dcaAbi, usdcAbi } from "../constants";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function CurrentInvestment({
  dcaAddress,
  usdcAddress,
  shouldReloadUI,
}) {
  const { account, isWeb3Enabled } = useMoralis();
  const [currentInvestment, setCurrentInvestment] = useState("0");
  const [balance, setBalance] = useState("0");

  /**************************************
   *
   * Smart contract function calls
   *
   **************************************/

  const { runContractFunction: getCurrentInvestment } = useWeb3Contract({
    abi: dcaAbi,
    contractAddress: dcaAddress,
    functionName: "getAmountInvestedForAddress",
    params: { investor: account },
  });

  const { runContractFunction: getBalance } = useWeb3Contract({
    abi: usdcAbi,
    contractAddress: usdcAddress,
    functionName: "balanceOf",
    params: { account: account },
  });

  /**************************************
   *
   * Render UI
   *
   **************************************/

  async function updateUIValues() {
    const currentInvestmentFromCall = (await getCurrentInvestment()).toString();
    setCurrentInvestment(currentInvestmentFromCall);

    const balanceFromCall = (await getBalance()).toString();
    setBalance(balanceFromCall);
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUIValues();
    }
  }, [isWeb3Enabled, shouldReloadUI]);

  return (
    <div>
      {dcaAddress ? (
        <div>
          <div>
            Your current investment :{" "}
            {ethers.utils.formatUnits(currentInvestment, 6)}{" "}
          </div>
          <div>Your Usdc balance : {ethers.utils.formatUnits(balance, 6)} </div>
        </div>
      ) : (
        <div>
          <p>No contract address</p>
        </div>
      )}
    </div>
  );
}
