import { useWeb3Contract } from "react-moralis";
import { useMoralis } from "react-moralis";
import { dcaAbi, usdcAbi } from "../constants";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Image from "next/image";

export default function CurrentInvestment({
  dcaAddress,
  usdcAddress,
  shouldReloadUI,
}) {
  const { account, isWeb3Enabled } = useMoralis();
  const [currentInvestment, setCurrentInvestment] = useState(0);
  const [tokenToBuy, setTokenToBuy] = useState("");
  const [amountToBuy, setAmountToBuy] = useState(0);
  const [buyFrequency, setBuyFrequency] = useState(0);
  const [nextBuyTimestamp, setNextBuyTimestamp] = useState(0);
  const [balance, setBalance] = useState(0);

  /**************************************
   *
   * Smart contract function calls
   *
   **************************************/

  const dcaContractParams = (functionName) => {
    return {
      abi: dcaAbi,
      contractAddress: dcaAddress,
      functionName: functionName,
      params: { investor: account },
    };
  };

  const { runContractFunction: getCurrentInvestment } = useWeb3Contract(
    dcaContractParams("getAmountInvestedForAddress")
  );

  const { runContractFunction: getTokenToBuy } = useWeb3Contract(
    dcaContractParams("getTokenToBuyForAddress")
  );

  const { runContractFunction: getAmountToBuy } = useWeb3Contract(
    dcaContractParams("getAmountToBuyForAddress")
  );

  const { runContractFunction: getBuyFrequency } = useWeb3Contract(
    dcaContractParams("getBuyIntervalForAddress")
  );

  const { runContractFunction: getNextBuyTimestamp } = useWeb3Contract(
    dcaContractParams("getNextBuyTimestampForAddress")
  );

  const { runContractFunction: getBalance } = useWeb3Contract({
    abi: usdcAbi,
    contractAddress: usdcAddress,
    functionName: "balanceOf",
    params: { account: account },
  });

  /**************************************
   *
   * Render UI
   *
   **************************************/

  const updateUIValues = async () => {
    const currentInvestmentFromCall = (await getCurrentInvestment()).toString();
    const tokenToBuyFromCall = (await getTokenToBuy()).toString();
    const amountToBuyFromCall = (await getAmountToBuy()).toString();
    const buyFrequencyFromCall = (await getBuyFrequency()).toString();
    const nextBuyTimestampFromCall = (await getNextBuyTimestamp()).toString();
    setCurrentInvestment(currentInvestmentFromCall);
    setTokenToBuy(tokenToBuyFromCall);
    setAmountToBuy(amountToBuyFromCall);
    setBuyFrequency(buyFrequencyFromCall);
    setNextBuyTimestamp(nextBuyTimestampFromCall);

    const balanceFromCall = (await getBalance()).toString();
    setBalance(balanceFromCall);
  };

  const logoFromAddress = (address) => {
    switch (address.toUpperCase()) {
      case "0XC02AAA39B223FE8D0A0E5C4F27EAD9083C756CC2":
        return "/img/logos/eth.svg";
      case "0X2260FAC5E5542A773AA44FBCFEDF7C193BC2C599":
        return "/img/logos/btc.svg";
      case "0X7C9F4C87D911613FE9CA58B579F737911AAD2D43":
        return "/img/logos/matic.svg";
      default:
        return "/img/logos/eth.svg";
    }
  };

  const dateStringFromTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUIValues();
    }
  }, [isWeb3Enabled, shouldReloadUI]);

  return (
    <div>
      {dcaAddress ? (
        <div>
          <div>
            Your current investment :{" "}
            {ethers.utils.formatUnits(currentInvestment, 6)}{" "}
          </div>
          <div>
            Token to buy :
            <Image
              src={logoFromAddress(tokenToBuy)}
              alt="token"
              width={60}
              height={60}
            />
          </div>
          <div>
            Max amount to buy : {ethers.utils.formatUnits(amountToBuy, 6)}{" "}
          </div>
          <div>Buy frequency : {buyFrequency / 60 / 24} days</div>
          <div>Your Usdc balance : {ethers.utils.formatUnits(balance, 6)} </div>
          <div>Next buy date : {dateStringFromTimestamp(nextBuyTimestamp)}</div>
        </div>
      ) : (
        <div>
          <p>No contract address</p>
        </div>
      )}
    </div>
  );
}
