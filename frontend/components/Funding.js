import { useWeb3Contract } from "react-moralis";

export default function Funding() {
  const { data, error, runContractFunction, isFetching, isLoading } =
    useWeb3Contract({
      abi: usdcEthPoolAbi,
      contractAddress: usdcEthPoolAddress,
      functionName: "fund",
      params: {},
      msgValue: 0.1,
    });

  return <div>Foobar</div>;
}
