import { useEffect, useState } from "react";
import { dcaAbi } from "../constants";
import { ethers } from "ethers";

export default function Funding({ dcaAddress, onChangeBalance }) {
  const { isWeb3Enabled } = useMoralis();
  const dispatch = useNotification();

  /**************************************
   *
   * Smart contract function calls
   *
   **************************************/

  const {
    runContractFunction: withdrawFromContract,
    isFetching,
    isLoading,
  } = useWeb3Contract({
    abi: dcaAbi,
    contractAddress: dcaAddress,
    functionName: "withdraw",
    params: {},
  });

  const handleSuccess = async (tx) => {
    try {
      await tx.wait(1);
      console.log("trasaction successful");
      handleSuccessNotification();
      onChangeBalance();
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

  return (
    <div>
      {dcaAddress ? (
        <div>
          <div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={isFetching || isLoading}
              onClick={async () => {
                await withdrawFromContract({
                  onSuccess: handleSuccess,
                  onError: (error) => console.log(error),
                });
                console.log("Withdrawing from contract");
              }}
            >
              {isLoading || isFetching ? (
                <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
              ) : (
                <div>Withdraw</div>
              )}
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
