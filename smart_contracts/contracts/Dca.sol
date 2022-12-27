// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "./SimpleSwap.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
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
    uint private constant MAX_SLIPPAGE_BPS = 5;

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

        InvestConfig memory investConfig = s_addressToInvestConfig[msg.sender];
        if (!investConfig.exists) {
            s_investors.push(msg.sender);
        }

        uint256 nextBuyTimestamp = block.timestamp + buyInterval;
        amountToBuy = amountToBuy * 10 ** USDC_DECIMALS;
        uint256 index = s_investors.length - 1;
        uint256 totalDepositAmount = investConfig.amountDeposited +
            formatedDepositAmount;

        s_addressToInvestConfig[msg.sender].tokenToBuy = tokenToBuyAddress;
        s_addressToInvestConfig[msg.sender].amountToBuy = amountToBuy;
        s_addressToInvestConfig[msg.sender].buyInterval = buyInterval;
        s_addressToInvestConfig[msg.sender].nextBuyTimestamp = nextBuyTimestamp;
        s_addressToInvestConfig[msg.sender]
            .amountDeposited = totalDepositAmount;
        s_addressToInvestConfig[msg.sender].index = index;
        s_addressToInvestConfig[msg.sender].exists = true;
    }

    function withdraw() public {
        InvestConfig memory investConfig = s_addressToInvestConfig[msg.sender];

        uint256 amountToWithdraw = investConfig.amountDeposited;
        if (amountToWithdraw <= 0) revert Dca__WithdrawError();

        s_addressToInvestConfig[msg.sender].amountDeposited = 0;

        deleteAddress(msg.sender);

        s_usdc.transfer(msg.sender, amountToWithdraw);
    }

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

            console.log("Check if Swap if need for address : %o ", investor);

            InvestConfig memory investConfig = s_addressToInvestConfig[
                investor
            ];

            if (investConfig.nextBuyTimestamp > block.timestamp) {
                console.log(
                    "Next buy timestamp not reached : %o , current tiemstamp : %o",
                    investConfig.nextBuyTimestamp,
                    block.timestamp
                );
                continue;
            }

            uint256 amountToSwap = Math.min(
                investConfig.amountToBuy,
                investConfig.amountDeposited
            );

            console.log(
                "Swap USDC for Token : %o , with amount : %o",
                investConfig.tokenToBuy,
                amountToSwap
            );
            uint256 amountOut = swapper.swap(
                amountToSwap,
                address(s_usdc),
                investConfig.tokenToBuy,
                investor,
                MAX_SLIPPAGE_BPS
            );

            //Asset Swap failed
            if (amountOut == 0) {
                console.log("Swap failed");
                continue;
            }

            s_addressToInvestConfig[investor].amountDeposited -= amountToSwap;

            if (s_addressToInvestConfig[investor].amountDeposited <= 0) {
                console.log(
                    "No more fund to swap, removing address from investors list"
                );
                deleteAddress(investor);
            } else {
                s_addressToInvestConfig[investor].nextBuyTimestamp =
                    block.timestamp +
                    investConfig.buyInterval;
            }
        }
    }

    function getAmountInvestedForAddress(
        address investor
    ) public view returns (uint256) {
        return s_addressToInvestConfig[investor].amountDeposited;
    }

    function getTokenToBuyForAddress(
        address investor
    ) public view returns (address) {
        return s_addressToInvestConfig[investor].tokenToBuy;
    }

    function getBuyIntervalForAddress(
        address investor
    ) public view returns (uint256) {
        return s_addressToInvestConfig[investor].buyInterval;
    }

    function getNextBuyTimestampForAddress(
        address investor
    ) public view returns (uint256) {
        return s_addressToInvestConfig[investor].nextBuyTimestamp;
    }

    function getAmounToBuyForAddress(
        address investor
    ) public view returns (uint256) {
        return s_addressToInvestConfig[investor].amountToBuy;
    }

    function getKeepersUpdateInterval() public view returns (uint) {
        return keepersUpdateInterval;
    }

    function isInvestor(address investor) public view returns (bool) {
        uint256 index = s_addressToInvestConfig[investor].index;
        return s_investors[index] == investor;
    }

    function getInvestors() public view returns (address[] memory) {
        return s_investors;
    }
}
