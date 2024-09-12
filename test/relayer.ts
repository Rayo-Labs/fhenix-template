import { FhenixClient, getPermit } from "fhenixjs";
import hre from "hardhat";
import deployments from "../deployments/testnet/FhenixBridge.json";

const contractAddress = deployments.address;

const contractABI = deployments.abi

const { fhenixjs, ethers } = hre;

const fhenixClient = new FhenixClient({ provider: ethers.provider });

const contract = new ethers.Contract(contractAddress, contractABI, ethers.provider);

let permit;

async function main() {
  permit = await getPermit(contractAddress, ethers.provider);
  fhenixClient.storePermit(permit);
  console.log("Permit", permit);

  contract.on('Packet', (log1, log2, log3, log4, log5) => {
    console.log("Packet Events", log1, log2, log3, log4, log5);

    const clearTo = fhenixClient.unseal(contractAddress, log3);
    const clearAmount = fhenixClient.unseal(contractAddress, log4)

    console.log("Clear To", clearTo.toString(16));
    console.log("Clear Amount", clearAmount);
    /*     const parsedEvent = JSON.parse(logs);
        console.log("Parsed Event", parsedEvent);
        const cleartext = fhenixClient.unseal(contractAddress, logs)
        console.log("Cleartext", cleartext); */

    /*     if (events.length === 0) return;
    
        events.forEach((event) => {
          console.log("Packet", event);
          try {
            const decodedEvent = decodeEventLog({
              abi: fhenixBridgeABI,
              data: event.data,
              topics: event.topics,
            });
            //const decodedPacket = decodedEvent.args as DecodedPacket;
            console.log("Decoded Event", decodedEvent);
            const jsonString = JSON.stringify(
              decodedEvent,
              (key, value) => {
                return typeof value === "bigint" ? value.toString() : value;
              },
              2
            );
            if (!jsonString) {
              console.error("No JSON String");
              return;
            }
            fs.writeFileSync("decodedEvent.json", jsonString);
          } catch (error) {
            console.error("Decode Error: ", error);
          }
        }); */
  });
}

main()