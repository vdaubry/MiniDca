import { useState } from "react";
import Image from "next/image";
import { contractAddresses } from "../constants";

export default function FundingFormModal({ isVisible, onClose, onOk }) {
  const { chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  let wethAddress, wbtcAddress, wmaticAddress;

  if (chainIdHex && contractAddresses[chainId]) {
    wethAddress = contractAddresses[chainId]["weth"];
    wbtcAddress = contractAddresses[chainId]["wbtc"];
    wmaticAddress = contractAddresses[chainId]["wmatic"];
  }

  const [fundingAmount, setFundingAmount] = useState(0);
  const [tokenToBuyAddress, setTokenToBuyAddress] = useState(wethAddress);
  const [amountToBuy, setAmountToBuy] = useState(0);
  const [buyInterval, setBuyInterval] = useState(0);

  return (
    <div></div>
    // <Modal
    //   isVisible={isVisible}
    //   onCancel={onClose}
    //   onCloseButtonPressed={onClose}
    //   onOk={() => {
    //     onOk(fundingAmount, tokenToBuyAddress, amountToBuy, buyInterval);
    //   }}
    // >
    //   <div className="mb-6">
    //     <Input
    //       label="Amount you want to fund (USDC)"
    //       name="Funding Amount"
    //       type="number"
    //       onChange={(event) => {
    //         setFundingAmount(event.target.value);
    //       }}
    //       className="mb-4"
    //     />
    //   </div>
    //   <div className="mb-6">
    //     <Select
    //       defaultOptionIndex={0}
    //       id="Select"
    //       label="Asset to buy"
    //       width="320px"
    //       onChange={(event) => {
    //         setTokenToBuyAddress(event.id);
    //       }}
    //       options={[
    //         {
    //           id: wethAddress,
    //           label: "Wrapped ETH (WETH)",
    //           prefix: (
    //             <Image
    //               src="/img/logos/eth.svg"
    //               alt="Reporting"
    //               width={30}
    //               height={30}
    //             />
    //           ),
    //         },
    //         {
    //           id: wbtcAddress,
    //           label: "Wrapped BTC (WBTC)",
    //           prefix: (
    //             <Image
    //               src="/img/logos/btc.svg"
    //               alt="Reporting"
    //               width={30}
    //               height={30}
    //             />
    //           ),
    //         },
    //         {
    //           id: wmaticAddress,
    //           label: "Wrapped Matic (WMATIC)",
    //           prefix: (
    //             <Image
    //               src="/img/logos/matic.svg"
    //               alt="Reporting"
    //               width={30}
    //               height={30}
    //             />
    //           ),
    //         },
    //       ]}
    //     />
    //   </div>
    //   <div className="mb-6">
    //     <Input
    //       label="Amount you want to buy (target token)"
    //       name="Amount to buy"
    //       type="number"
    //       onChange={(event) => {
    //         setAmountToBuy(event.target.value);
    //       }}
    //       className="mb-4"
    //     />
    //   </div>
    //   <div className="mb-6">
    //     <Select
    //       defaultOptionIndex={0}
    //       id="Select"
    //       label="Frequency of buying"
    //       width="320px"
    //       onChange={(event) => {
    //         setBuyInterval(event.id);
    //       }}
    //       options={[
    //         {
    //           id: 60 * 60 * 24, // 1 day
    //           label: "Daily",
    //         },
    //         {
    //           id: 60 * 60 * 24 * 7, // 7 day
    //           label: "Weekly",
    //         },
    //         {
    //           id: 60 * 60 * 24 * 30, // 30 day
    //           label: "Monthly (every 30 days)",
    //         },
    //       ]}
    //     />
    //   </div>
    // </Modal>
  );
}
