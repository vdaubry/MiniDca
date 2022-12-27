// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.7;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-core/contracts/libraries/FixedPoint96.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract SimpleSwap {
    ISwapRouter public immutable swapRouter;
    IUniswapV3Factory public immutable uniswapV3Factory;
    uint24 public constant FEE_TIER = 3000;
    uint256 public constant MAX_SLIPPAGE_PERCENTAGE = 50;

    event SwappedFor(uint256 amountOut);

    /// @notice Creates a new SimpleSwap contract
    /// @dev see https://docs.uniswap.org/contracts/v3/reference/deployments
    /// @param _swapRouter The contract address of the uniswap V3 router
    constructor(ISwapRouter _swapRouter, IUniswapV3Factory _uniswapV3Factory) {
        swapRouter = _swapRouter;
        uniswapV3Factory = _uniswapV3Factory;
    }

    /// @notice Swaps the specified amount of tokenA for tokenB
    /// @param amountIn The amount of tokenA to swap
    /// @param tokenA token address to swap from
    /// @param tokenB token address to swap to
    /// @return amountOut The amount of tokenB received
    function swap(
        uint256 amountIn,
        address tokenA,
        address tokenB,
        address recipient
    ) external returns (uint256 amountOut) {
        console.log(
            "Calling swap with msg.sender : %o ; tokenA : %o, balance: %o",
            msg.sender,
            tokenA,
            IERC20(tokenA).balanceOf(msg.sender)
        );
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

        // We dont set any constraint on the price the swap will push the pool to
        uint160 priceLimit = 0;

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: tokenA,
                tokenOut: tokenB,
                fee: FEE_TIER,
                recipient: recipient,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: minOut,
                sqrtPriceLimitX96: priceLimit
            });

        // Swap the specified amount of tokenA for tokenB.
        amountOut = swapRouter.exactInputSingle(params);
        emit SwappedFor(amountOut);

        return (amountOut);
    }

    /// @notice Returns the price of tokenB in tokenA
    /// @param tokenA token address to swap from
    /// @param tokenB token address to swap to
    /// @return The price of tokenB in tokenA
    /// @dev We get the price from sqrtPriceX96 : https://docs.uniswap.org/sdk/v3/guides/fetching-prices
    /// @dev We use the following formula to get the price :
    /// @dev p = (sqrtPriceX96 / Q96) ** 2
    /// @dev => tokenBPriceInTokenA = 1 / p
    /// @dev => tokenBPriceInTokenA = 10 ** (decimalsTokenB) / ((sqrtPriceX96/q96) ** 2)
    function getTokenBPriceInTokenA(
        address tokenA,
        address tokenB
    ) public view returns (uint256) {
        IUniswapV3Pool pool = IUniswapV3Pool(
            uniswapV3Factory.getPool(tokenA, tokenB, FEE_TIER)
        );

        // https://docs.uniswap.org/contracts/v3/reference/core/interfaces/pool/IUniswapV3PoolState#slot0
        (uint160 sqrtPriceX96, , , , , , ) = pool.slot0();

        uint256 decimalsTokenB = ERC20(tokenB).decimals();
        uint256 q96 = 2 ** 96;

        uint256 numerator = 10 ** (decimalsTokenB);
        uint256 denominator;
        if (sqrtPriceX96 > q96) {
            denominator = ((sqrtPriceX96 / q96) ** 2);
        } else {
            denominator = ((q96 / sqrtPriceX96) ** 2);
        }

        uint256 priceOfTokenBInTokenA = numerator / denominator;
        return priceOfTokenBInTokenA;
    }

    /// @notice Returns the price of tokenA in tokenB
    /// @param tokenA token address to swap from
    /// @param tokenB token address to swap to
    /// @return The price of tokenA in tokenB
    /// @dev Inverse of getTokenBPriceInTokenA (tokenAPriceInTokenB = p)
    /// @dev p = (sqrtPriceX96 / Q96) ** 2
    function getTokenAPriceInTokenB(
        address tokenA,
        address tokenB
    ) public view returns (uint256) {
        IUniswapV3Pool pool = IUniswapV3Pool(
            uniswapV3Factory.getPool(tokenA, tokenB, FEE_TIER)
        );

        (uint160 sqrtPriceX96, , , , , , ) = pool.slot0();
        uint256 decimalsTokenA = ERC20(tokenA).decimals();
        uint256 q96 = 2 ** 96;

        uint256 numerator = 10 ** decimalsTokenA;
        uint256 denominator;
        if (sqrtPriceX96 > q96) {
            denominator = ((sqrtPriceX96 / q96) ** 2);
        } else {
            denominator = ((q96 / sqrtPriceX96) ** 2);
        }

        uint256 priceOfTokenAInTokenB = denominator / numerator;
        return priceOfTokenAInTokenB;
    }
}
