import { useEffect, useState } from "react";
import { useWeb3Contract } from "react-moralis";
import { abi } from "../constants";
import { useMoralis } from "react-moralis";
import { ethers } from "ethers";
import { useNotification, Bell } from "web3uikit";

export default function Funding({ dcaAddress }) {
  const { isWeb3Enabled } = useMoralis();
  const dispatch = useNotification();

  /**************************************
   *
   * Smart contract function calls
   *
   **************************************/

  const {
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

  async function updateUIValues() {}

  useEffect(() => {
    if (isWeb3Enabled) {
    }
  }, [isWeb3Enabled]);

  return (
    <div>
      {dcaAddress ? (
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={isFetching || isLoading}
            onClick={async () => {
              await fundContract({
                onSuccess: handleSuccess,
                onError: (error) => console.log(error),
              });
              console.log("Funding contract");
            }}
          >
            {isLoading || isFetching ? (
              <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              <div>Fund contract</div>
            )}
          </button>
        </div>
      ) : (
        <div>
          <p>No contract address</p>
        </div>
      )}
    </div>
  );
}
