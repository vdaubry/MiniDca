// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "./SimpleSwap.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "hardhat/console.sol";

error Dca__DepositError();
error Dca__WithdrawError();
error Dca__UpkeepNotNeeded();

contract Dca is AutomationCompatibleInterface {
    mapping(address => uint256) s_addressToAmountDeposited;
    mapping(address => InvestConfig) s_addressToInvestConfig;
    address[] s_investors;

    struct InvestConfig {
        address tokenToBuy;
        uint256 amountToBuy;
        uint256 buyInterval;
        uint256 nextBuyTimestamp;
    }

    IERC20 private s_usdc;

    uint public immutable keepersUpdateInterval;
    uint public lastTimeStamp;

    SimpleSwap immutable swapper;

    constructor(
        address _usdcAddress,
        uint _keepersUpdateInterval,
        address _swapperAddress
    ) {
        s_usdc = IERC20(_usdcAddress);
        keepersUpdateInterval = _keepersUpdateInterval;
        lastTimeStamp = block.timestamp;
        swapper = SimpleSwap(_swapperAddress);
        s_investors = new address[](0);
        s_usdc.approve(address(swapper), type(uint256).max);
    }

    function deposit(
        uint256 depositAmount,
        address tokenToBuyAddress,
        uint256 amountToBuy,
        uint256 buyInterval
    ) public {
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

        uint256 nextBuyTimestamp = block.timestamp + buyInterval;
        ERC20 tokenToBuy = ERC20(tokenToBuyAddress);
        amountToBuy = amountToBuy * 10 ** tokenToBuy.decimals();
        InvestConfig memory investConfig = InvestConfig(
            tokenToBuyAddress,
            amountToBuy,
            buyInterval,
            nextBuyTimestamp
        );
        s_addressToInvestConfig[msg.sender] = investConfig;

        //todo : if an investor deposit again, we should not add it again to the investor list
        s_investors.push(msg.sender);
    }

    function withdraw() public {
        uint256 amountToWithdraw = s_addressToAmountDeposited[msg.sender];
        if (amountToWithdraw <= 0) revert Dca__WithdrawError();

        s_addressToAmountDeposited[msg.sender] = 0;

        //Todo : find a way to remove an element from an array
        //s_investors = remove(s_investors, msg.sender);

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

        for (uint i = 0; i < s_investors.length; i++) {
            address investor = s_investors[i];
            InvestConfig memory investConfig = s_addressToInvestConfig[
                investor
            ];

            if (investConfig.nextBuyTimestamp > block.timestamp) {
                uint256 amountToSwap = investConfig.amountToBuy;

                swapper.swap(
                    amountToSwap,
                    address(s_usdc),
                    investConfig.tokenToBuy
                );

                // todo: check if swap was successful
                // todo: update nextBuyTimestamp
                // todo: decrease s_addressToAmountDeposited
                // todo: if s_addressToAmountDeposited is 0, remove investor from s_investors
                // todo: if s_addressToAmountDeposited < amountToSwap, swap only what is left
            }
        }
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
