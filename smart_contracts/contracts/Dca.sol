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
    mapping(address => InvestConfig) s_addressToInvestConfig;
    address[] s_investors;

    struct InvestConfig {
        address tokenToBuy;
        uint256 amountToBuy;
        uint256 buyInterval;
        uint256 nextBuyTimestamp;
        uint256 amountDeposited;
        uint index;
        bool exists;
    }

    IERC20 private s_usdc;

    uint256 public immutable keepersUpdateInterval;
    uint256 public lastTimeStamp;

    SimpleSwap immutable swapper;

    uint public constant USDC_DECIMALS = 6;

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

        uint256 formatedDepositAmount = depositAmount * 10 ** USDC_DECIMALS;
        require(
            s_usdc.transferFrom(
                msg.sender,
                address(this),
                formatedDepositAmount
            ),
            "deposit: transferFrom failed"
        );

        //todo : if an investor deposit again, we should not add it again to the investor list
        s_investors.push(msg.sender);

        uint256 nextBuyTimestamp = block.timestamp + buyInterval;
        ERC20 tokenToBuy = ERC20(tokenToBuyAddress);
        amountToBuy = amountToBuy * 10 ** tokenToBuy.decimals();
        uint256 index = s_investors.length - 1;
        InvestConfig memory investConfig = InvestConfig(
            tokenToBuyAddress,
            amountToBuy,
            buyInterval,
            nextBuyTimestamp,
            formatedDepositAmount,
            index,
            true
        );
        s_addressToInvestConfig[msg.sender] = investConfig;
    }

    function withdraw() public {
        InvestConfig memory investConfig = s_addressToInvestConfig[msg.sender];

        uint256 amountToWithdraw = investConfig.amountDeposited;
        if (amountToWithdraw <= 0) revert Dca__WithdrawError();

        s_addressToInvestConfig[msg.sender].amountDeposited = 0;

        //Todo : find a way to remove an element from an array
        //s_investors = remove(s_investors, msg.sender);

        s_usdc.transfer(msg.sender, amountToWithdraw);
    }

    //todo: add unit tests
    /// @notice remove an investor from investors array
    /// @dev first we swap the last element of the array with the element to remove
    /// @dev then we remove the last element of the array
    /// @param addressToDelete the address of the investor to remove
    /// @return true if the investor was removed
    function deleteAddress(address addressToDelete) internal returns (bool) {
        InvestConfig memory investConfig = s_addressToInvestConfig[
            addressToDelete
        ];

        require(investConfig.exists, "Investor does not exist");
        require(
            investConfig.amountDeposited <= 0,
            "Cannot remove an investor with a positive balance"
        );

        if (investConfig.index != s_investors.length - 1) {
            address lastAddress = s_investors[s_investors.length - 1];
            s_investors[investConfig.index] = lastAddress;
            s_addressToInvestConfig[lastAddress].index = investConfig.index;
        }
        s_investors.pop();
        return true;
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

                // todo: update nextBuyTimestamp
                // todo: decrease s_addressToAmountDeposited
                // todo: if s_addressToAmountDeposited is 0, remove investor from s_investors
                // todo: if s_addressToAmountDeposited < amountToSwap, swap only what is left
                // todo: check if swap was successful + retry ?
            }
        }
    }

    function getAmountInvestedForAddress(
        address investor
    ) public view returns (uint256) {
        return s_addressToInvestConfig[investor].amountDeposited;
    }

    function getKeepersUpdateInterval() public view returns (uint) {
        return keepersUpdateInterval;
    }
}
