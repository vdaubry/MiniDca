import { useEffect, useState } from "react";
import { useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { useMoralis } from "react-moralis";
import { ethers } from "ethers";
import { useNotification, Bell } from "web3uikit";

export default function Funding() {
  const { chainId: chainIdHex, account, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const dcaAddress =
    chainIdHex && contractAddresses[chainId]
      ? contractAddresses[chainId]["dca"]
      : null;
  const [currentInvestment, setCurrentInvestment] = useState("0");
  const dispatch = useNotification();

  /**************************************
   *
   * Smart contract function calls
   *
   **************************************/

  const {
    data,
    error,
    runContractFunction: fundContract,
    isFetching,
    isLoading,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: dcaAddress,
    functionName: "fund",
    params: {},
    msgValue: ethers.utils.parseEther("0.1"),
  });

  const { runContractFunction: getCurrentInvestment } = useWeb3Contract({
    abi: abi,
    contractAddress: dcaAddress,
    functionName: "getAmountInvestedForAddress",
    params: { investor: account },
  });

  const handleSuccess = async (tx) => {
    try {
      await tx.wait(1);
      console.log("trasaction successful");
      handleSuccessNotification();
      updateUIValues();
    } catch (error) {
      console.log(error);
    }
  };

  /**************************************
   *
   * UI Helpers
   *
   **************************************/

  const handleSuccessNotification = () => {
    dispatch({
      type: "info",
      message: "Transaction completed !",
      title: "Tx notification",
      position: "topR",
      icon: <Bell fontSize={20} />,
    });
  };

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
          <div>
            Your current investment :{" "}
            {ethers.utils.formatEther(currentInvestment)}{" "}
          </div>
          <div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={async () => {
                await fundContract({
                  // onComplete:
                  // onError:
                  onSuccess: handleSuccess,
                  onError: (error) => console.log(error),
                });
                console.log("Funding contract");
              }}
            >
              Fund contract
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p>No contract address</p>
        </div>
      )}
    </div>
  );
}
