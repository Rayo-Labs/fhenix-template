import { FhenixClient, getPermit } from "fhenixjs";
import hre from "hardhat";
import deployments from "../deployments/testnet/FhenixBridge.json";
import { createInstance as createFhevmClient } from "fhevmjs";

const fhenixBridgeContractAddress = deployments.address;
const zamaBridgeContractAddress = "0xcfBA155e87dA8Ed34B263a78f224e188D53A8264";

const fhenixContractABI = deployments.abi;
const zamaContractABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_tokenAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "euint64",
        "name": "encryptedAmount",
        "type": "uint256"
      }
    ],
    "name": "IntentProcessed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "eaddress",
        "name": "to",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "euint64",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "relayer",
        "type": "address"
      }
    ],
    "name": "Packet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "num",
        "type": "uint256"
      }
    ],
    "name": "TestPacket",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "acceptOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "einput",
        "name": "_encryptedTo",
        "type": "bytes32"
      },
      {
        "internalType": "einput",
        "name": "_encryptedAmount",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_inputProof",
        "type": "bytes"
      },
      {
        "internalType": "address",
        "name": "_relayerAddress",
        "type": "address"
      }
    ],
    "name": "bridgeWEERC20",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "gateway",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint64",
        "name": "",
        "type": "uint64"
      }
    ],
    "name": "intents",
    "outputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "euint64",
        "name": "encryptedAmount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextIntentId",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "einput",
        "name": "_encryptedAmount",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "onRecvIntent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pendingOwner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "testEmit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "weerc20",
    "outputs": [
      {
        "internalType": "contract IZamaWEERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "einput",
        "name": "_encryptedAmount",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_inputProof",
        "type": "bytes"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const { fhenixjs, ethers } = hre;

const fhenixProvider = ethers.provider;
const zamaProvider = new ethers.JsonRpcProvider("https://devnet.zama.ai");

const zamaWallet = new ethers.Wallet(process.env.KEY!, zamaProvider);

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
}

main();
