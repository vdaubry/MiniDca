// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

error Dca__WithdrawError();

contract Dca {
    mapping(address => uint256) s_addressToAmountDeposited;
    IERC20 private s_usdc;
    ISwapRouter public immutable swapRouter;
    address public constant DAI =
        address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
    address public constant WETH9 =
        address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
    uint24 public constant feeTier = 3000;

    constructor(address usdcAddress, ISwapRouter _swapRouter) {
        s_usdc = IERC20(usdcAddress);
        swapRouter = _swapRouter;
    }

    function deposit(uint256 depositAmount) public {
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
        if (amountToWithdraw <= 0) {
            return;
        }

        s_addressToAmountDeposited[msg.sender] = 0;
        s_usdc.transfer(msg.sender, amountToWithdraw);
    }

    function swapWETHForDAI(
        uint256 amountIn
    ) external returns (uint256 amountOut) {
        // Transfer the specified amount of WETH9 to this contract.
        TransferHelper.safeTransferFrom(
            WETH9,
            msg.sender,
            address(this),
            amountIn
        );
        // Approve the router to spend WETH9.
        TransferHelper.safeApprove(WETH9, address(swapRouter), amountIn);
        // Note: To use this example, you should explicitly set slippage limits, omitting for simplicity
        uint256 minOut = 0; /* Calculate min output */
        uint160 priceLimit = 0; /* Calculate price limit */
        // Create the params that will be used to execute the swap
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: WETH9,
                tokenOut: DAI,
                fee: feeTier,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: minOut,
                sqrtPriceLimitX96: priceLimit
            });
        // The call to `exactInputSingle` executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
    }

    function getAmountInvestedForAddress(
        address investor
    ) public view returns (uint256) {
        return s_addressToAmountDeposited[investor];
    }
}
