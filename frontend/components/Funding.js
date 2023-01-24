import { useEffect, useState } from "react";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { dcaAbi } from "../constants";
import FundingFormModal from "./FundingFormModal";
import { useNotification, Bell } from "web3uikit";

export default function Funding({
  dcaAddress,
  usdcAddress,
  onChangeBalance,
  wethAddress,
  wbtcAddress,
  wmaticAddress,
}) {
  const [isModalVisible, setIsModalVisible] = useState(0);
  const [fundingAmount, setFundingAmount] = useState(0);
  const [tokenToBuyAddress, setTokenToBuyAddress] = useState(
    "0x7c9f4c87d911613fe9ca58b579f737911aad2d43"
  );
  const [amountToBuy, setAmountToBuy] = useState(0);
  const [buyInterval, setBuyInterval] = useState(0);
  const [shouldFundContract, setShouldFundContract] = useState(false);

  const dispatch = useNotification();

  /**************************************
   *
   * Smart contract function calls
   *
   **************************************/

  const { config } = usePrepareContractWrite({
    address: dcaAddress,
    abi: dcaAbi,
    functionName: "deposit",
    args: [fundingAmount, tokenToBuyAddress, amountToBuy, buyInterval],
  });

  const { data, write: deposit } = useContractWrite({
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
  //   runContractFunction: deposit,
  //   isFetching,
  //   isLoading,
  // } = useWeb3Contract({
  //   abi: dcaAbi,
  //   contractAddress: dcaAddress,
  //   functionName: "deposit",
  //   params: {
  //     depositAmount: fundingAmount,
  //     tokenToBuyAddress: tokenToBuyAddress,
  //     amountToBuy: amountToBuy,
  //     buyInterval: buyInterval,
  //   },
  // });

  // const handleSuccess = async (tx) => {
  //   try {
  //     await tx.wait(1);
  //     setIsModalVisible(false);
  //     handleSuccessNotification();
  //     onChangeBalance();
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

  const handleFundContract = () => {
    setShouldFundContract(false);
    deposit();

    // await deposit({
    //   onSuccess: handleSuccess,
    //   onError: (error) => {
    //     handleFailureNotification(error[0]);
    // });
  };

  useEffect(() => {
    if (shouldFundContract) {
      handleFundContract();
    }
  }, [shouldFundContract]);

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
            disabled={!deposit || isLoading}
            onClick={() => {
              setIsModalVisible(true);
            }}
          >
            {isLoading ? (
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
