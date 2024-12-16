import { FhenixClient, getPermit } from "fhenixjs";

import hre from "hardhat";

const { fhenixjs, ethers } = hre;

const wallets: { [key: number]: string } = {
  1: process.env.KEY as string,
  2: process.env.KEY2 as string,
  3: process.env.KEY3 as string,
};

const contractAddress = "0x1C3D23d808D7843D2B1aC30fE03fDE05ceb97D06";
const relayerAddress = "0xA139Bcfb689926ebCF2AABDbd32FBaFC250e70d9";
const contractABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "euint64",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "IntentProcesses",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "eaddress",
        name: "encryptedTo",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "euint64",
        name: "encryptedAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "toPermit",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "amountPermit",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "relayerAddress",
        type: "address",
      },
    ],
    name: "Packet",
    type: "event",
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct inEaddress",
        name: "_encryptedTo",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct inEuint64",
        name: "_encryptedAmount",
        type: "tuple",
      },
      {
        internalType: "address",
        name: "_relayerAddress",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_relayerSeal",
        type: "bytes32",
      },
    ],
    name: "bridgeWEERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    name: "intents",
    outputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "euint64",
        name: "amount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextIntentId",
    outputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        components: [
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct inEuint64",
        name: "_encryptedAmount",
        type: "tuple",
      },
    ],
    name: "onRecvIntent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pendingOwner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "weerc20",
    outputs: [
      {
        internalType: "contract IFhenixWEERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct inEuint64",
        name: "_encryptedAmount",
        type: "tuple",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

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
    new ethers.JsonRpcProvider("https://api.nitrogen.fhenix.zone"),
  );
  const client = new FhenixClient({ provider: hre.ethers.provider });

  if (cfunc === "bridgeWEERC20") {
    const encryptedTo = await client.encrypt_address(args[0]);
    const encryptedAmount = await client.encrypt_uint64(args[1]);
    const seal =
      "0xf01347c80b552b714b3c51e5d6666362451adbf030e47dcdc02160619fd13831";

    args[0] = encryptedTo;
    args[1] = encryptedAmount;
    args[2] = relayerAddress;
    args[3] = seal;
  } else if (cfunc === "onRecvIntent") {
    const encryptedIntentId = await client.encrypt_uint64(args[1]);
    args[1] = encryptedIntentId;
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
    case "nextIntentId":
      await ContractCall(Number(wallet), param1);
      break;
    case "intents":
      await ContractCall(Number(wallet), param1, [param2]);
      break;
    case "bridgeWEERC20":
      await ContractCall(Number(wallet), param1, [
        param2,
        BigInt(Number(param3) * 10 ** 6),
      ]);
      break;
    case "onRecvIntent":
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
