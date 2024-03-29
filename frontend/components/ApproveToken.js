import { useEffect, useState } from "react";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { usdcAbi } from "../constants";
import { ethers } from "ethers";
import { useNotification, Bell } from "web3uikit";

export default function ApproveToken({ dcaAddress, usdcAddress }) {
  const dispatch = useNotification();

  /**************************************
   *
   * Smart contract function calls
   *
   **************************************/

  const { config } = usePrepareContractWrite({
    address: usdcAddress,
    abi: usdcAbi,
    functionName: "approve",
    args: [dcaAddress, ethers.constants.MaxInt256],
  });

  const { data, write: approveUsdc } = useContractWrite({
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
  //   runContractFunction: approveUsdc,
  //   isFetching,
  //   isLoading,
  // } = useWeb3Contract({
  //   abi: usdcAbi,
  //   contractAddress: usdcAddress,
  //   functionName: "approve",
  //   params: { spender: dcaAddress, amount: ethers.constants.MaxInt256 },
  // });

  // const handleSuccess = async (tx) => {
  //   try {
  //     await tx.wait(1);
  //     console.log("transaction successful");
  //     handleSuccessNotification();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

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

  const handleFailureNotification = (msg) => {
    dispatch({
      type: "error",
      message: msg,
      title: "Error",
      position: "topR",
      icon: <Bell fontSize={20} />,
    });
  };

  // const handleApproveContract = async () => {
  //   await approveUsdc({
  //     onSuccess: handleSuccess,
  //     onError: (error) => handleFailureNotification(error.message),
  //   });
  // };

  // useEffect(() => {
  //   if (isWeb3Enabled) {
  //   }
  // }, [isWeb3Enabled]);

  return (
    <div>
      <div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={!approveUsdc}
          onClick={() => approveUsdc?.()}
        >
          {isLoading ? (
            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
          ) : (
            <div>Approve USDC</div>
          )}
        </button>
      </div>
    </div>
  );
}
