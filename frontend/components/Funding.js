import { useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { useMoralis } from "react-moralis";

export default function Funding() {
  const { chainId: chainIdHex } = useMoralis();
  if (chainIdHex != null) {
    const chainId = parseInt(chainIdHex);
    const dcaAddress = contractAddresses[chainId]["dca"];

    // const {
    //   data,
    //   error,
    //   runContractFunction: fundContract,
    //   isFetching,
    //   isLoading,
    // } = useWeb3Contract({
    //   contractAddress: dcaAddress,
    //   functionName: "fund",
    //   params: {},
    //   msgValue: 0.1,
    // });
  }

  return (
    <div>
      <button>Fund contract</button>
    </div>
  );
}
