import { dcaAbi, usdcAbi } from "../constants";
import { useEffect, useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import { ethers } from "ethers";
import Image from "next/image";

export default function CurrentInvestment({
  dcaAddress,
  usdcAddress,
  shouldReloadUI,
}) {
  const { address: account, isConnected } = useAccount();

  const [currentInvestment, setCurrentInvestment] = useState(0);
  const [tokenToBuy, setTokenToBuy] = useState("");
  const [amountToBuy, setAmountToBuy] = useState(0);
  const [buyFrequency, setBuyFrequency] = useState(0);
  const [nextBuyDateStr, setNextBuyDateStr] = useState("");
  const [balance, setBalance] = useState(0);

  /**************************************
   *
   * Smart contract function calls
   *
   **************************************/

  const dcaContractParams = (functionName) => {
    return {
      address: dcaAddress,
      abi: dcaAbi,
      functionName: functionName,
      args: [account],
    };
  };

  const { data: currentInvestmentFromCall } = useContractRead(
    dcaContractParams("getAmountInvestedForAddress")
  );

  const { data: tokenToBuyFromCall } = useContractRead(
    dcaContractParams("getTokenToBuyForAddress")
  );

  const { data: amountToBuyFromCall } = useContractRead(
    dcaContractParams("getAmountToBuyForAddress")
  );

  const { data: buyFrequencyFromCall } = useContractRead(
    dcaContractParams("getBuyIntervalForAddress")
  );

  const { data: nextBuyTimestampFromCall } = useContractRead(
    dcaContractParams("getNextBuyTimestampForAddress")
  );

  const { data: balanceFromCall } = useContractRead({
    address: usdcAddress,
    abi: usdcAbi,
    functionName: "balanceOf",
    args: [account],
  });

  // /**************************************
  //  *
  //  * Render UI
  //  *
  //  **************************************/

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
    const dataLoaded = currentInvestmentFromCall !== undefined;

    if (dataLoaded) {
      setCurrentInvestment(currentInvestmentFromCall);
      setTokenToBuy(tokenToBuyFromCall);
      setAmountToBuy(amountToBuyFromCall);
      setBuyFrequency(buyFrequencyFromCall);
      setNextBuyDateStr(dateStringFromTimestamp(nextBuyTimestampFromCall));
      setBalance(balanceFromCall);
    }
  }, [currentInvestmentFromCall]);

  return (
    <div>
      <div>
        Your current investment :{" "}
        {ethers.utils.formatUnits(currentInvestment.toString(), 6)}{" "}
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
      <div>Max amount to buy : {ethers.utils.formatUnits(amountToBuy, 6)} </div>
      <div>Buy frequency : {buyFrequency / 60 / 24} days</div>
      <div>Your Usdc balance : {ethers.utils.formatUnits(balance, 6)} </div>
      <div>Next buy date : {nextBuyDateStr}</div>
    </div>
  );
}
