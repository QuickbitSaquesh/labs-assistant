import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

export const setupWallet = async () => {
  const rpc_url = Bun.env.SOLANA_RPC_URL ?? "http://localhost:8899";
  const connection = new Connection(rpc_url, "confirmed");
  const secretKey = Bun.env.STAR_ATLAS_WALLET_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "STAR_ATLAS_WALLET_SECRET_KEY environment variable is not set"
    );
  }

  const walletKeypair = Keypair.fromSecretKey(bs58.decode(secretKey));

  if (!PublicKey.isOnCurve(walletKeypair.publicKey.toBytes())) {
    throw Error("wallet keypair is not on curve");
  }

  return { connection, walletKeypair };
};
