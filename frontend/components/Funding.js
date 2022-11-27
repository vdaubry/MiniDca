import { useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { useMoralis } from "react-moralis";
import { ethers } from "ethers";

export default function Funding() {
  const { chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const dcaAddress =
    chainIdHex && contractAddresses[chainId]
      ? contractAddresses[chainId]["dca"]
      : null;

  const {
    data,
    error,
    runContractFunction: fundContract,
    isFetching,
    isLoading,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: dcaAddress,
    functionName: "fund",
    params: {},
    msgValue: ethers.utils.parseEther("0.1"),
  });

  const handleSuccess = async (tx) => {
    try {
      await tx.wait(1);
      console.log("trasaction successful");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {dcaAddress ? (
        <button
          onClick={async () => {
            await fundContract({
              // onComplete:
              // onError:
              onSuccess: handleSuccess,
              onError: (error) => console.log(error),
            });
            console.log("Funding contract");
          }}
        >
          Fund contract
        </button>
      ) : (
        <div>
          <p>No contract address</p>
        </div>
      )}
    </div>
  );
}
