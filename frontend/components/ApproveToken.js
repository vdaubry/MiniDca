import { useEffect, useState } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { abi } from "../constants";
import { ethers } from "ethers";
import { useNotification, Bell } from "web3uikit";
import FundingFormModal from "./FundingFormModal";

export default function ApproveToken({ dcaAddress, usdcAddress }) {
  const [isModalVisible, setIsModalVisible] = useState(0);
  const { account, isWeb3Enabled } = useMoralis();
  const dispatch = useNotification();

  /**************************************
   *
   * Smart contract function calls
   *
   **************************************/

  const {
    runContractFunction: approveUsdc,
    isFetching,
    isLoading,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: usdcAddress,
    functionName: "allowance",
    params: { owner: account, spender: dcaAddress },
  });

  const handleSuccess = async (tx) => {
    try {
      await tx.wait(1);
      console.log("transaction successful");
      handleSuccessNotification();
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

  const handleApproveContract = async () => {
    await approveUsdc({
      onSuccess: handleSuccess,
      onError: (error) => console.log(error),
    });
  };

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
            onClick={() => {
              handleApproveContract();
            }}
          >
            {isLoading || isFetching ? (
              <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              <div>Approve USDC</div>
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
