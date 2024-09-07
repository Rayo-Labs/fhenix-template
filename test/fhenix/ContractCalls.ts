import { abi } from "./contract_calls/abi";
import deployments from "../../deployments/testnet/FhenixWEERC20.json";

import hre from "hardhat";

const { fhenixjs, ethers } = hre;

const contractAddress = deployments.address; // 0x8d55cD2853081F80f9f8c6FEE4e949590240c005 // 0x02af3256c398131bDe388310b305c8Cf6E7f8844

async function ContractCall(
  ca: string,
  cabi: any,
  cfunc: string,
  cargs: any[] = [],
  cvalue: string = "0",
) {
  let args = cargs;
  const privateKey = process.env.KEY as string;
  const wallet = new ethers.Wallet(
    privateKey,
    new ethers.JsonRpcProvider("https://api.helium.fhenix.zone"),
  );
  if (cfunc === "unwrap") {
    await fhenixjs.generatePermit(ca, undefined, wallet);
    args[0] = await fhenixjs.encrypt_uint64(cargs[0]);
  } else if (cfunc === "transferEncrypted") {
    await fhenixjs.generatePermit(ca, undefined, wallet);
    args[1] = await fhenixjs.encrypt_uint64(cargs[1]);
  }
  const contract = new ethers.Contract(ca, cabi, wallet);
  const result = await contract[cfunc](...args, {
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
    case "getEncryptedBalance":
      await ContractCall(contractAddress, abi, "getEncryptedBalance", [param2]);
      break;
    case "wrap":
      const wrapAmount = BigInt(Number(param2) * 10 ** 18);
      await ContractCall(contractAddress, abi, "wrap", [wrapAmount]);
      break;
    case "unwrap":
      const unwrapAmount = BigInt(Number(param2));
      await ContractCall(contractAddress, abi, "unwrap", [unwrapAmount]);
      break;
    case "transferEncrypted":
      const [to, value] = [param2, param3];
      await ContractCall(contractAddress, abi, "transferEncrypted", [
        to,
        value,
      ]);
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
