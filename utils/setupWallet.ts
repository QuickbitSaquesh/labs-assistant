import { Connection, Keypair } from "@solana/web3.js";
import { readFileSync } from "fs";
import { keypairPath, rpcPath } from "../common/constants";

export const setupWallet = async () => {
  const rpcUrl = readFileSync(rpcPath).toString();
  const connection = new Connection(rpcUrl, "confirmed");
  const secretKey = JSON.parse(readFileSync(keypairPath).toString());

  const walletKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));

  return { connection, walletKeypair };
};
