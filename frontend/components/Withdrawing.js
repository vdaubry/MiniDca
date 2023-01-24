import { useEffect, useState } from "react";
import { dcaAbi } from "../constants";
import { useNotification, Bell } from "web3uikit";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

export default function Funding({ dcaAddress, onChangeBalance }) {
  const dispatch = useNotification();

  /**************************************
   *
   * Smart contract function calls
   *
   **************************************/

  const { config } = usePrepareContractWrite({
    address: dcaAddress,
    abi: dcaAbi,
    functionName: "withdraw",
    args: [],
  });

  const { data, write: withdrawFromContract } = useContractWrite({
    ...config,
  });

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    confirmations: 1,
    onError(error) {
      handleFailureNotification(error.message);
    },
    onSuccess(data) {
      handleSuccessNotification();
    },
  });

  // const {
  //   runContractFunction: withdrawFromContract,
  //   isFetching,
  //   isLoading,
  // } = useWeb3Contract({
  //   abi: dcaAbi,
  //   contractAddress: dcaAddress,
  //   functionName: "withdraw",
  //   params: {},
  // });

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
      <div>
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={!withdrawFromContract}
            onClick={() => withdrawFromContract?.()}
          >
            {isLoading ? (
              <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              <div>Withdraw</div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
