// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.8.0;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "hardhat/console.sol";

contract SimpleSwap {
    ISwapRouter public immutable swapRouter;
    uint24 public constant feeTier = 3000;

    event SwappedFor(uint256 amountOut);

    /// @notice Creates a new SimpleSwap contract
    /// @dev see https://docs.uniswap.org/contracts/v3/reference/deployments
    /// @param _swapRouter The contract address of the uniswap V3 router
    constructor(ISwapRouter _swapRouter) {
        swapRouter = _swapRouter;
    }

    /// @notice Swaps the specified amount of tokenA for tokenB
    /// @param amountIn The amount of tokenA to swap
    /// @param tokenA token address to swap from
    /// @param tokenB token address to swap to
    /// @return amountOut The amount of tokenB received
    function swap(
        uint256 amountIn,
        address tokenA,
        address tokenB
    ) external returns (uint256 amountOut) {
        console.log("Calling sampleAdd with %o", amountIn);

        require(amountIn > 0, "amountIn must be greater than 0");

        require(
            IERC20(tokenA).balanceOf(msg.sender) >= amountIn,
            "Swap: Insufficient balance"
        );

        require(
            IERC20(tokenA).allowance(msg.sender, address(this)) >= amountIn,
            "Swap: Insufficient allowance"
        );

        // Transfer the specified amount of tokenA to this contract.
        TransferHelper.safeTransferFrom(
            tokenA,
            msg.sender,
            address(this),
            amountIn
        );

        // Approve the router to spend tokenA.
        TransferHelper.safeApprove(tokenA, address(swapRouter), amountIn);

        // TODO: set slippage limits
        uint256 minOut = 0;
        uint160 priceLimit = 0;

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: tokenA,
                tokenOut: tokenB,
                fee: feeTier,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: minOut,
                sqrtPriceLimitX96: priceLimit
            });

        // Swap the specified amount of tokenA for tokenB.
        amountOut = swapRouter.exactInputSingle(params);
        emit SwappedFor(amountOut);

        return (2);
    }
}
