import { FhenixClient, getPermit } from "fhenixjs";
import deployments from "../../deployments/testnet/FhenixBridge.json";

import hre from "hardhat";

const { fhenixjs, ethers } = hre;

const wallets: { [key: number]: string } = {
  1: process.env.KEY as string,
  2: process.env.KEY2 as string,
  3: process.env.KEY3 as string,
};

const contractAddress = deployments.address;
const relayerAddress = "0x9C3Ad2B5f00EC8e8564244EBa59692Dd5e57695b";
const contractABI = deployments.abi;

function padToBytes32(hexString: string): string {
  if (!hexString.startsWith("0x")) {
    hexString = "0x" + hexString;
  }

  const hexWithoutPrefix = hexString.slice(2);

  if (hexWithoutPrefix.length > 64) {
    throw new Error("Input hex string is too long to be converted to bytes32");
  }

  const paddedHex = hexWithoutPrefix.padStart(64, "0");

  return "0x" + paddedHex;
}

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

  if (cfunc === "bridgeWEERC20") {
    const encryptedTo = await client.encrypt_address(args[0]);
    const encryptedAmount = await client.encrypt_uint64(args[1]);
    const seal = ethers.keccak256(padToBytes32(relayerAddress));

    args[0] = encryptedTo;
    args[1] = encryptedAmount;
    args[2] = relayerAddress;
    args[3] = seal;
  } else if (cfunc === "withdraw") {
    const encryptedAmount = await client.encrypt_uint64(args[0]);
    args[0] = encryptedAmount;
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

  switch (param1) {
    case "bridgeWEERC20":
      await ContractCall(Number(wallet), param1, [
        param2,
        BigInt(Number(param3) * 10 ** 6),
      ]);
      break;
    case "withdraw":
      await ContractCall(Number(wallet), param1, [
        BigInt(Number(param2) * 10 ** 6),
      ]);
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