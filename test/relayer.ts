import { FhenixClient, getPermit } from "fhenixjs";
import hre from "hardhat";
import { createInstance as createFhevmClient } from "fhevmjs";
import { zamaContractABI } from "../utils/ABI/ZamaContractABI";
import { fhenixContractABI } from "../utils/ABI/FhenixContractABI";

const fhenixBridgeContractAddress =
  "0x1C3D23d808D7843D2B1aC30fE03fDE05ceb97D06";
const zamaBridgeContractAddress = "0xD794f10F660319fDDA742145A40673a128EAbbcA";

const { fhenixjs, ethers } = hre;

const fhenixProvider = ethers.provider;
const zamaProvider = new ethers.JsonRpcProvider("https://devnet.zama.ai");

const zamaWallet = new ethers.Wallet(process.env.KEY3!, zamaProvider);

const fhenixClient = new FhenixClient({ provider: fhenixProvider });

const fhenixBridgeContract = new ethers.Contract(
  fhenixBridgeContractAddress,
  fhenixContractABI,
  fhenixProvider,
);
const zamaBridgeContract = new ethers.Contract(
  zamaBridgeContractAddress,
  zamaContractABI,
  zamaWallet,
);

let permit; // fhenix permit
let zamaClient: any; // zama fhevm client

async function main() {
  // set fhenix permit
  permit = await getPermit(fhenixBridgeContractAddress, fhenixProvider);
  if (!permit) {
    throw new Error("Permit not found");
  }
  fhenixClient.storePermit(permit);
  console.log("Permit", permit);

  // set zama fhevm instance
  zamaClient = await createFhevmClient({
    networkUrl: "https://devnet.zama.ai",
    gatewayUrl: "https://gateway.devnet.zama.ai",
  });
  console.log("Instance", zamaClient);

  const { publicKey, privateKey: reEncryptPrivateKey } =
    zamaClient.generateKeypair();

  const eip712 = zamaClient.createEIP712(publicKey, zamaBridgeContractAddress);

  const signature = await zamaWallet.signMessage(JSON.stringify(eip712));

  const [signer] = await ethers.getSigners();

  console.log("Running the relayer as address", signer.address);

  // listen for packet events
  fhenixBridgeContract.on("Packet", async (log1, log2, log3, log4, log5) => {
    console.log("Packet Events", log1, log2, log3, log4, log5);

    const clearTo = `0x${fhenixClient
      .unseal(fhenixBridgeContractAddress, log3)
      .toString(16)}`;
    const clearAmount = fhenixClient.unseal(fhenixBridgeContractAddress, log4);

    console.log("Clear To", clearTo);
    console.log("Clear Amount", clearAmount);

    const einput = zamaClient.createEncryptedInput(
      zamaBridgeContractAddress,
      signer.address,
    );
    const einputs = einput.add64(clearAmount).encrypt();

    console.log("encrypted inputs, calling onRecvIntent on Zama");

    const onRecvIntentResult = await zamaBridgeContract.onRecvIntent(
      clearTo,
      einputs.handles[0],
      einputs.inputProof,
    );

    console.log("onRecvIntent called on Zama: ", onRecvIntentResult);
    /*     const parsedEvent = JSON.parse(logs);
        console.log("Parsed Event", parsedEvent);
        const cleartext = fhenixClient.unseal(contractAddress, logs)
        console.log("Cleartext", cleartext); */

    // console.log("Clear To", clearTo.toString(16));
    // console.log("Clear Amount", clearAmount);
  });

  zamaBridgeContract.on("IntentProcessed", (log1, log2, log3) => {
    console.log("Intent Processed", log1, log2, log3);
  });

  zamaBridgeContract.on("TestPacket", (log1) => {
    console.log("TestPacket works", log1);
  });

  zamaBridgeContract.on("Packet", async (log1, log2, log3) => {
    console.log("Packet", log1, log2, log3);

    console.log("is log1", log1);
    console.log("is reEncryptPrivateKey", reEncryptPrivateKey);
    console.log("is publicKey", publicKey);
    console.log("is signature", signature);
    console.log("is zamaBridgeContractAddress", zamaBridgeContractAddress);
    console.log("is zamaWallet.address", zamaWallet.address);
    const userDecryptedTo = await zamaClient.reencrypt(
      log1,
      reEncryptPrivateKey,
      publicKey,
      signature,
      zamaBridgeContractAddress,
      zamaWallet.address,
    );

    console.log("is log2", log2);
    console.log("is reEncryptPrivateKey", reEncryptPrivateKey);
    console.log("is publicKey", publicKey);
    console.log("is signature", signature);
    console.log("is zamaBridgeContractAddress", zamaBridgeContractAddress);
    console.log("is zamaWallet.address", zamaWallet.address);

    const userDecryptedAmount = await zamaClient.reencrypt(
      log2,
      reEncryptPrivateKey,
      publicKey,
      signature,
      zamaBridgeContractAddress,
      zamaWallet.address,
    );

    const hexAddress = "0x" + userDecryptedTo.toString(16).padStart(40, "0");
    const readableAmount = userDecryptedAmount.toString();

    console.log("to is", hexAddress);
    console.log("amount is", readableAmount);
  });
}

main();
