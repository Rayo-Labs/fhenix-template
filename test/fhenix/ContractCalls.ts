import { abi } from "./contract_calls/abi";

import hre from "hardhat";

const { fhenixjs, ethers } = hre;

const contractAddress = "0xb7485CDcEE71023390a0253D80020799F2967E36";

async function ContractCall(
  ca: string,
  cabi: any,
  cfunc: string,
  cargs: any[] = [],
  cvalue: string = "0",
) {
  const privateKey = process.env.KEY as string;
  const wallet = new ethers.Wallet(
    privateKey,
    new ethers.JsonRpcProvider("https://api.helium.fhenix.zone"),
  );
  const contract = new ethers.Contract(ca, cabi, wallet);
  const result = await contract[cfunc](...cargs, {
    value: BigInt(Number(cvalue) * 10 ** 18),
  });
  console.log("result: ", result);
}

async function main() {
  const param = process.argv[2];
  const param2 = process.argv[3];
  const param3 = process.argv[4];
  switch (param) {
    case "getDecimals":
      await ContractCall(contractAddress, abi, "decimals");
      break;
    case "getTotalSupply":
      await ContractCall(contractAddress, abi, "totalSupply");
      break;
    case "getBalance":
      await ContractCall(contractAddress, abi, "balanceOf", [param2]);
      break;
    case "wrap":
      const amount = BigInt(Number(param2));
      await ContractCall(contractAddress, abi, "wrap", [amount]);
      break;
    default:
      console.log("Invalid parameter");
      console.log("Your param: ", param);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
