import { Address } from "hardhat-deploy/types";
import type { Counter } from "../types";
import type { FheInstance } from "../utils/instance";
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/dist/src/signer-with-address";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
  export interface Context {
    counter: Counter;
    instance: FheInstance;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Signers {
  admin: SignerWithAddress;
}

export type EventPacketArgs = {
  encryptedTo: bigint;
  encryptedAmount: bigint;
  toPermit: string;
  amountPermit: string;
  relayerAddress: Address;
};

export type EventPacket = {
  eventName: string;
  args: EventPacketArgs;
};
