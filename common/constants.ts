import { PublicKey } from "@solana/web3.js";
import { homedir } from "os";
import path from "path";

export const MAX_AMOUNT = 999_999_999;

export const quattrinoTokenPubkey = new PublicKey(
  "DpToMmwsZk2GQTMKhyfQBTG4UHUeCsTrzLXvnVS2H8bj"
);

export const configDir = path.join(homedir(), ".labsAssistantConfig");

export const keypairPath = path.join(configDir, "keypair.json");

export const rpcPath = path.join(configDir, "rpc.txt");
