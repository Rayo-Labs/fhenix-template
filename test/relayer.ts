import { FhenixClient, getPermit } from "fhenixjs";
import hre from "hardhat";
import deployments from "../deployments/testnet/FhenixBridge.json";

import { abi } from "./zama/abi";

// # FOR FHENIX
// const contractAddress = deployments.address;
// const contractABI = deployments.abi;

// # FOR ZAMA
const contractAddress = "0xD581086aE74B6e5936201A30D264E17D14eAfF0C";
const contractABI = abi;

const { fhenixjs, ethers } = hre;

const fhenixClient = new FhenixClient({ provider: ethers.provider });

const provider = new ethers.JsonRpcProvider("https://devnet.zama.ai");

const contract = new ethers.Contract(
  contractAddress,
  contractABI,
  provider, // ethers.provider
);

let permit;

async function main() {
  // permit = await getPermit(contractAddress, ethers.provider);
  // if (!permit) {
  //   throw new Error("Permit not found");
  // }
  // fhenixClient.storePermit(permit);
  // console.log("Permit", permit);

  console.log("Watching for events...");

  contract.on("TestPacket", (log) => {
    console.log("Packet Events", log);

    // const clearTo = fhenixClient.unseal(contractAddress, log3);
    // const clearAmount = fhenixClient.unseal(contractAddress, log4)

    // console.log("Clear To", clearTo.toString(16));
    // console.log("Clear Amount", clearAmount);
  });
}

main();
