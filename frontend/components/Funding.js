import { useEffect, useState } from "react";
import { useWeb3Contract } from "react-moralis";
import { abi } from "../constants";
import { useMoralis } from "react-moralis";
import { ethers } from "ethers";
import { useNotification, Bell } from "web3uikit";
import FundingFormModal from "./FundingFormModal";

export default function Funding({ dcaAddress, usdcAddress, onChangeBalance }) {
  const [isModalVisible, setIsModalVisible] = useState(0);
  const { isWeb3Enabled } = useMoralis();
  const dispatch = useNotification();
  const [fundingAmount, setFundingAmount] = useState("0");
  const [shouldFundContract, setShouldFundContract] = useState(false);

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
    msgValue: ethers.utils.parseEther(fundingAmount),
  });

  const handleSuccess = async (tx) => {
    try {
      await tx.wait(1);
      console.log("transaction successful");
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

  const onClose = () => {
    setIsModalVisible(false);
  };

  const onOk = async (_fundingAmount) => {
    setFundingAmount(_fundingAmount);
    setShouldFundContract(true);
    console.log("Funding contract");
  };

  const handleFundContract = async () => {
    setShouldFundContract(false);
    await fundContract({
      onSuccess: handleSuccess,
      onError: (error) => console.log(error),
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
