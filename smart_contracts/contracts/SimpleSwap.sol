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

    /// @notice Creates a new SimpleSwap contract
    /// @notice see https://docs.uniswap.org/contracts/v3/reference/deployments
    /// @param _swapRouter The contract address of the uniswap V3 router
    /// @param _DAI 'from' token address to swap from
    /// @param _WETH9 'to' token address to swap to
    constructor(ISwapRouter _swapRouter, address _DAI, address _WETH9) {
        swapRouter = _swapRouter;
        DAI = _DAI;
        WETH9 = _WETH9;
    }

    /// @notice Swaps the specified amount of WETH9 for DAI
    /// @param amountIn The amount of WETH9 to swap
    /// @return amountOut The amount of DAI received
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

        // TODO: set slippage limits
        uint256 minOut = 0;
        uint160 priceLimit = 0;

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

        // Swap the specified amount of WETH9 for DAI.
        amountOut = swapRouter.exactInputSingle(params);
        emit SwappedFor(amountOut);

        return (2);
    }
}
