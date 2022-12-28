import { Modal, Input, Select } from "web3uikit";
import { useState } from "react";

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
      <Input
        label="Amount you want to fund (USDC)"
        name="Funding Amount"
        type="number"
        onChange={(event) => {
          setFundingAmount(event.target.value);
        }}
      />

      <Select
        defaultOptionIndex={0}
        id="Select"
        label="Choose the asset you want to buy"
        onChange={function noRefCheck() {}}
        options={[
          {
            id: "emoji",
            label: "Emoji",
            prefix: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
          },
          {
            id: "txt",
            label: "TXT",
            prefix: "TXT",
          },
        ]}
      />
    </Modal>
  );
}
