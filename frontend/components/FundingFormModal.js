import { Modal, Input, Select, CryptoLogos } from "web3uikit";
import { useState } from "react";
import Image from "next/image";

export default function FundingFormModal({ isVisible, onClose, onOk }) {
  const [fundingAmount, setFundingAmount] = useState(0);
  const [tokenToBuyAddress, setTokenToBuyAddress] = useState("");
  const [amountToBuy, setAmountToBuy] = useState(0);
  const [buyInterval, setBuyInterval] = useState(0);

  return (
    <Modal
      isVisible={isVisible}
      onCancel={onClose}
      onCloseButtonPressed={onClose}
      onOk={() => {
        onOk(fundingAmount, tokenToBuyAddress, amountToBuy, buyInterval);
      }}
    >
      <div className="mb-6">
        <Input
          label="Amount you want to fund (USDC)"
          name="Funding Amount"
          type="number"
          onChange={(event) => {
            setFundingAmount(event.target.value);
          }}
          class="mb-4"
        />
      </div>
      <div className="mb-6">
        <Select
          defaultOptionIndex={0}
          id="Select"
          label="Asset to buy"
          width="320px"
          onChange={function noRefCheck() {}}
          options={[
            {
              id: "eth",
              label: "Wrapped ETH (WETH)",
              prefix: (
                <Image
                  src="/img/logos/eth.svg"
                  alt="Reporting"
                  width={30}
                  height={30}
                />
              ),
            },
            {
              id: "btc",
              label: "Wrapped BTC (WBTC)",
              prefix: (
                <Image
                  src="/img/logos/btc.svg"
                  alt="Reporting"
                  width={30}
                  height={30}
                />
              ),
            },
            {
              id: "matic",
              label: "Wrapped Matic (WMATIC)",
              prefix: (
                <Image
                  src="/img/logos/matic.svg"
                  alt="Reporting"
                  width={30}
                  height={30}
                />
              ),
            },
          ]}
        />
      </div>
    </Modal>
  );
}
