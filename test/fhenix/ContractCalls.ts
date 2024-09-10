import { abi } from "./abi";
import { FhenixClient, getPermit } from "fhenixjs";
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
  const client = new FhenixClient({ provider: hre.ethers.provider });

  if (cfunc === "unwrap") {
    const encryptedUint64 = await client.encrypt_uint64(args[0]);
    args[0] = encryptedUint64;
  } else if (cfunc === "transferEncrypted") {
    args[1] = await fhenixjs.encrypt_uint64(cargs[1]);
  } else if (cfunc === "getBalanceEncrypted") {
    const permit = await getPermit(contractAddress, hre.ethers.provider);
    const permission = client.extractPermitPermission(permit!);
    console.log(permission);
    args[0] = permission;
  } else if (cfunc === "approveEncrypted") {
    args[1] = await fhenixjs.encrypt_uint64(cargs[1]);
  }

  const contract = new ethers.Contract(ca, cabi, wallet);
  const result = await contract[cfunc](...args, {
    value: BigInt(Number(cvalue) * 10 ** 18),
    // gasPrice: ethers.parseUnits("50", "gwei"),
    // gasLimit: 20000000,
  });
  console.log("result: ", result);
}

async function main() {
  const param = process.argv[2];
  const param2 = process.argv[3];
  const param3 = process.argv[4];
  const param4 = process.argv[5];

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
    case "approve":
      const [approveTo, approveAmount] = [param2, param3];
      await ContractCall(contractAddress, abi, "approveEncrypted", [
        approveTo,
        BigInt(Number(approveAmount) * 10 ** 6),
      ]);
      break;
    case "wrap":
      const wrapAmount = BigInt(Number(param2) * 10 ** 18);
      await ContractCall(contractAddress, abi, "wrap", [wrapAmount]);
      break;
    case "unwrap":
      const unwrapAmount = BigInt(Number(param2) * 10 ** 6);
      await ContractCall(contractAddress, abi, "unwrap", [unwrapAmount]);
      break;
    case "transferEncrypted":
      const [to, value] = [param2, param3];
      await ContractCall(contractAddress, abi, "transferEncrypted", [
        to,
        BigInt(Number(value) * 10 ** 6),
      ]);
      break;
    case "transferFromEncrypted":
      const [fromTransferFrom, toTransferFrom, encAmount] = [
        param2,
        param3,
        param4,
      ];
      console.log("param2", param2, "param3", param3, "param4", param4);
      const encryptedAmount = await fhenixjs.encrypt_uint64(
        BigInt(Number(encAmount) * 10 ** 6),
      );
      console.log(
        "from",
        fromTransferFrom,
        "to",
        toTransferFrom,
        "encrypted",
        encryptedAmount,
      );
      await ContractCall(contractAddress, abi, "transferFromEncrypted", [
        fromTransferFrom,
        toTransferFrom,
        encryptedAmount,
      ]);
      break;
    case "getBalanceEncrypted":
      await ContractCall(contractAddress, abi, "getBalanceEncrypted");
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
