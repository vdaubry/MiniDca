import { useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { useMoralis } from "react-moralis";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function CurrentInvestment() {
  const { chainId: chainIdHex, account, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const dcaAddress =
    chainIdHex && contractAddresses[chainId]
      ? contractAddresses[chainId]["dca"]
      : null;
  const [currentInvestment, setCurrentInvestment] = useState("0");

  /**************************************
   *
   * Smart contract function calls
   *
   **************************************/

  const { runContractFunction: getCurrentInvestment } = useWeb3Contract({
    abi: abi,
    contractAddress: dcaAddress,
    functionName: "getAmountInvestedForAddress",
    params: { investor: account },
  });

  /**************************************
   *
   * Render UI
   *
   **************************************/

  async function updateUIValues() {
    const currentInvestmentFromCall = (await getCurrentInvestment()).toString();
    setCurrentInvestment(currentInvestmentFromCall);
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUIValues();
    }
  }, [isWeb3Enabled]);

  return (
    <div>
      {dcaAddress ? (
        <div>
          Your current investment :{" "}
          {ethers.utils.formatEther(currentInvestment)}{" "}
        </div>
      ) : (
        <div>
          <p>No contract address</p>
        </div>
      )}
    </div>
  );
}
