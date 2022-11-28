// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error Dca__WithdrawError();

contract Dca {
    mapping(address => uint256) s_addressToAmountDeposited;
    IERC20 private s_usdc;

    constructor(address usdcAddress) {
        s_usdc = IERC20(usdcAddress);
    }

    function deposit(uint256 depositAmount) public {
        require(depositAmount > 0);

        uint256 formatedDepositAmount = depositAmount * 10 ** 6; //USDC has 6 decimals
        s_usdc.transferFrom(msg.sender, address(this), formatedDepositAmount);
        s_addressToAmountDeposited[msg.sender] += formatedDepositAmount;
    }

    function withdraw() public {
        uint256 amountToWithdraw = s_addressToAmountDeposited[msg.sender];
        if (amountToWithdraw <= 0) {
            return;
        }

        s_addressToAmountDeposited[msg.sender] = 0;
        s_usdc.transfer(msg.sender, amountToWithdraw);
    }

    function getAmountInvestedForAddress(
        address investor
    ) public view returns (uint256) {
        return s_addressToAmountDeposited[investor];
    }
}
