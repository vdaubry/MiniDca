// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "./SimpleSwap.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "hardhat/console.sol";

error Dca__DepositError();
error Dca__WithdrawError();
error Dca__UpkeepNotNeeded();

contract Dca is AutomationCompatibleInterface {
    mapping(address => uint256) s_addressToAmountDeposited;

    IERC20 private s_usdc;

    uint public immutable keepersUpdateInterval;
    uint public lastTimeStamp;

    SimpleSwap immutable swapper;

    constructor(
        address usdcAddress,
        uint _keepersUpdateInterval,
        address _swapperAddress
    ) {
        s_usdc = IERC20(usdcAddress);
        keepersUpdateInterval = _keepersUpdateInterval;
        lastTimeStamp = block.timestamp;
        swapper = SimpleSwap(_swapperAddress);
    }

    function deposit(uint256 depositAmount) public {
        console.log("Calling deposit");
        require(depositAmount > 0, "deposit: Amount must be greater than zero");
        require(
            s_usdc.allowance(msg.sender, address(this)) >= depositAmount,
            "deposit: Insufficient allowance"
        );

        uint256 formatedDepositAmount = depositAmount * 10 ** 6; //USDC has 6 decimals
        require(
            s_usdc.transferFrom(
                msg.sender,
                address(this),
                formatedDepositAmount
            ),
            "deposit: transferFrom failed"
        );
        s_addressToAmountDeposited[msg.sender] += formatedDepositAmount;
    }

    function withdraw() public {
        uint256 amountToWithdraw = s_addressToAmountDeposited[msg.sender];
        if (amountToWithdraw <= 0) revert Dca__WithdrawError();

        s_addressToAmountDeposited[msg.sender] = 0;
        s_usdc.transfer(msg.sender, amountToWithdraw);
    }

    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        upkeepNeeded =
            (block.timestamp - lastTimeStamp) > keepersUpdateInterval;
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) revert Dca__UpkeepNotNeeded();

        lastTimeStamp = block.timestamp;

        address usdc = address(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
        address weth = address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

        uint256 amountToSwap = 100_000000;
        IERC20(usdc).approve(address(swapper), amountToSwap);
        swapper.swap(amountToSwap, usdc, weth);
    }

    function getAmountInvestedForAddress(
        address investor
    ) public view returns (uint256) {
        return s_addressToAmountDeposited[investor];
    }

    function getKeepersUpdateInterval() public view returns (uint) {
        return keepersUpdateInterval;
    }
}
