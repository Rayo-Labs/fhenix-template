import { FhenixClient, getPermit } from "fhenixjs";
import hre from "hardhat";
import deployments from "../../deployments/testnet/FhenixBridge.json";

const contractAddress = deployments.address;

const { fhenixjs, ethers } = hre;

async function main() {
  // console.log(await hre.ethers.provider.getSigner())
  const client = new FhenixClient({ provider: hre.ethers.provider });
  const permit = await getPermit(contractAddress, hre.ethers.provider);
  if (!permit) {
    throw new Error("Permit not found");
  }
  client.storePermit(permit);
  console.log(permit);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
