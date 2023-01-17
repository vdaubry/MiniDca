import { useEffect, useState } from "react";
import { useNetwork, useAccount, useContractRead } from "wagmi";
import { dcaAbi } from "../constants";
import FundingFormModal from "./FundingFormModal";

export default function Funding({
  dcaAddress,
  usdcAddress,
  onChangeBalance,
  wethAddress,
  wbtcAddress,
  wmaticAddress,
}) {
  const [isModalVisible, setIsModalVisible] = useState(0);
  const dispatch = useNotification();
  // const [fundingAmount, setFundingAmount] = useState(0);
  // const [tokenToBuyAddress, setTokenToBuyAddress] = useState("");
  // const [amountToBuy, setAmountToBuy] = useState(0);
  // const [buyInterval, setBuyInterval] = useState(0);
  // const [shouldFundContract, setShouldFundContract] = useState(false);

  /**************************************
   *
   * Smart contract function calls
   *
   **************************************/

  const {
    runContractFunction: deposit,
    isFetching,
    isLoading,
  } = useWeb3Contract({
    abi: dcaAbi,
    contractAddress: dcaAddress,
    functionName: "deposit",
    params: {
      depositAmount: fundingAmount,
      tokenToBuyAddress: tokenToBuyAddress,
      amountToBuy: amountToBuy,
      buyInterval: buyInterval,
    },
  });

  const handleSuccess = async (tx) => {
    try {
      await tx.wait(1);
      setIsModalVisible(false);
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

  const handleFailureNotification = (msg) => {
    dispatch({
      type: "error",
      message: msg,
      title: "Error",
      position: "topR",
      icon: <Bell fontSize={20} />,
    });
  };

  const onClose = () => {
    setIsModalVisible(false);
  };

  const onOk = async (
    _fundingAmount,
    _tokenToBuyAddress,
    _amountToBuy,
    _buyInterval
  ) => {
    setFundingAmount(_fundingAmount);
    setTokenToBuyAddress(_tokenToBuyAddress);
    setAmountToBuy(_amountToBuy);
    setBuyInterval(_buyInterval);
    setShouldFundContract(true);
    setIsModalVisible(false);
  };

  const handleFundContract = async () => {
    setShouldFundContract(false);
    await deposit({
      onSuccess: handleSuccess,
      onError: (error) => {
        handleFailureNotification(error[0]);
      },
    });
  };

  useEffect(() => {
    if (isWeb3Enabled && shouldFundContract) {
      handleFundContract();
    }
  }, [isWeb3Enabled, shouldFundContract]);

  return (
    <div>
      {dcaAddress ? (
        <div>
          <FundingFormModal
            isVisible={isModalVisible}
            onClose={onClose}
            onOk={onOk}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={isFetching || isLoading}
            onClick={() => {
              setIsModalVisible(true);
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
