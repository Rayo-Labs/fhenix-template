import { FhenixClient, getPermit } from "fhenixjs";
import deployments from "../../deployments/testnet/FhenixWEERC20.json";

import hre from "hardhat";

const { fhenixjs, ethers } = hre;

const contractAddress = deployments.address; // 0x3Db8652F4F648e2090A5dA12013Dc1aee9f8B000
const contractABI = deployments.abi;

const wallets: { [key: number]: string } = {
  1: process.env.KEY as string,
  2: process.env.KEY2 as string,
  3: process.env.KEY3 as string,
};

async function ContractCall(
  key: number,
  cfunc: string,
  cargs: any[] = [],
  cvalue: string = "0",
) {
  let args = cargs;
  const wallet = new ethers.Wallet(
    wallets[key],
    new ethers.JsonRpcProvider("https://api.helium.fhenix.zone"),
  );
  const client = new FhenixClient({ provider: hre.ethers.provider });

  if (cfunc === "balanceOf") {
    if (args[0] === undefined) {
      args[0] = wallet.address;
    }
  } else if (cfunc === "encryptedBalanceOf") {
    const permit = await getPermit(contractAddress, hre.ethers.provider);
    const permission = client.extractPermitPermission(permit!);
    args[0] = permission;
  } else if (cfunc === "unwrap") {
    const encryptedUint64 = await client.encrypt_uint64(args[0]);
    args[0] = encryptedUint64;
  } else if (cfunc === "approveEncrypted") {
    args[1] = await fhenixjs.encrypt_uint64(cargs[1]);
  } else if (cfunc === "transferEncrypted") {
    args[1] = await fhenixjs.encrypt_uint64(cargs[1]);
  } else if (cfunc === "transferFromEncrypted") {
    args[2] = await fhenixjs.encrypt_uint64(cargs[2]);
  }

  const contract = new ethers.Contract(contractAddress, contractABI, wallet);
  const result = await contract[cfunc](...args, {
    value: BigInt(Number(cvalue) * 10 ** 18),
  });

  console.log("result: ", result);
}

async function main() {
  const wallet = process.argv[2];
  const param1 = process.argv[3];
  const param2 = process.argv[4];
  const param3 = process.argv[5];
  const param4 = process.argv[6];

  switch (param1) {
    case "totalSupply":
      await ContractCall(Number(wallet), param1);
      break;
    case "balanceOf":
      await ContractCall(Number(wallet), param1, [param2]);
      break;
    case "encryptedBalanceOf":
      await ContractCall(Number(wallet), param1);
      break;
    case "wrap":
      await ContractCall(Number(wallet), param1, [
        BigInt(Number(param2) * 10 ** 18),
      ]);
      break;
    case "unwrap":
      await ContractCall(Number(wallet), param1, [
        BigInt(Number(param2) * 10 ** 6),
      ]);
      break;
    case "approveEncrypted":
      await ContractCall(Number(wallet), param1, [
        param2,
        BigInt(Number(param3) * 10 ** 6),
      ]);
      break;
    case "transferEncrypted":
      await ContractCall(Number(wallet), param1, [
        param2,
        BigInt(Number(param3) * 10 ** 6),
      ]);
      break;
    case "transferFromEncrypted":
      await ContractCall(Number(wallet), param1, [param2, param3, param4]);
      break;
    default:
      console.log("Invalid parameter");
      console.log("Your param: ", param1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
