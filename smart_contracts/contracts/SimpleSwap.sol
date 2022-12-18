// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.8.0;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "hardhat/console.sol";

contract SimpleSwap {
    ISwapRouter public immutable swapRouter;
    address public immutable DAI;
    address public immutable WETH9;
    uint24 public constant feeTier = 3000;

    event SwappedFor(uint256 amountOut);

    constructor(ISwapRouter _swapRouter, address _DAI, address _WETH9) {
        swapRouter = _swapRouter;
        DAI = _DAI;
        WETH9 = _WETH9;
    }

    function swap(uint256 amountIn) external returns (uint256 amountOut) {
        console.log("Calling sampleAdd with %o", amountIn);

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
        uint256 minOut = /* Calculate min output */ 0;
        uint160 priceLimit = /* Calculate price limit */ 0;
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
        emit SwappedFor(amountOut);

        return (2);
    }
}
