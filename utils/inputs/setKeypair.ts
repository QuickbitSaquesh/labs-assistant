import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { existsSync, outputFileSync } from "fs-extra";
import inquirer from "inquirer";
import { keypairPath } from "../../common/constants";

export const setKeypair = () => {
  if (existsSync(keypairPath)) {
    return Promise.resolve();
  }

  return inquirer.prompt([
    {
      type: "password",
      name: "secretKey",
      message: "Enter your base58 secret key:",
      validate: (input) => {
        try {
          const keypair = Keypair.fromSecretKey(bs58.decode(input));

          if (!PublicKey.isOnCurve(keypair.publicKey.toBytes()))
            throw new Error("Wallet keypair is not on curve");

          outputFileSync(keypairPath, `[${keypair.secretKey.toString()}]`);
          return true;
        } catch (e) {
          return "Wrong secret key, please retry again";
        }
      },
    },
  ]);
};
