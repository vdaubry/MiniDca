// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

error Dca__WithdrawError();
error Dca__NothingToWithdraw();

contract Dca {
    mapping(address => uint256) s_addressToAmountInvested;

    function fund() public payable {
        s_addressToAmountInvested[msg.sender] += msg.value;
    }

    function withdraw() public {
        uint256 amountToWithdraw = s_addressToAmountInvested[msg.sender];
        if (amountToWithdraw <= 0) revert Dca__NothingToWithdraw();

        s_addressToAmountInvested[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: amountToWithdraw}("");
        if (!success) revert Dca__WithdrawError();
    }
}
