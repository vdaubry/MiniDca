// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

error Dca__WithdrawError();

contract Dca {
    mapping(address => uint256) s_addressToAmountInvested;

    constructor() {}

    function fund() public payable {
        s_addressToAmountInvested[msg.sender] += msg.value;
    }

    function withdraw() public {
        uint256 amountToWithdraw = s_addressToAmountInvested[msg.sender];
        if (amountToWithdraw <= 0) {
            return;
        }

        s_addressToAmountInvested[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: amountToWithdraw}("");
        if (!success) revert Dca__WithdrawError();
    }

    function getAmountInvestedForAddress(
        address investor
    ) public view returns (uint256) {
        return s_addressToAmountInvested[investor];
    }
}
