import { Modal, Input, useNotification } from "web3uikit";
import { useState } from "react";

export default function FundingFormModal({ isVisible, onClose, onOk }) {
  const [fundingAmount, setFundingAmount] = useState(0);

  return (
    <Modal
      isVisible={isVisible}
      onCancel={onClose}
      onCloseButtonPressed={onClose}
      onOk={() => {
        onOk(fundingAmount);
      }}
    >
      <Input
        label="Amount you want to fund (ETH)"
        name="Funding Amount"
        type="number"
        onChange={(event) => {
          setFundingAmount(event.target.value);
        }}
      />
    </Modal>
  );
}
