import { PublicKey } from "@solana/web3.js";
import { sageProvider } from "../utils/sageProvider";
import { buildAndSignTransactionAndCheck } from "../utils/transactions/buildAndSignTransactionAndCheck";
import { sendTransactionAndCheck } from "../utils/transactions/sendTransactionAndCheck";

export const exitSubwarp = async (fleetPubkey: PublicKey) => {
  const { sageGameHandler, sageFleetHandler } = await sageProvider();

  let ix = await sageFleetHandler.ixReadyToExitSubwarp(fleetPubkey);
  if (ix.type !== "Success") {
    throw new Error(ix.type);
  }

  try {
    let tx = await buildAndSignTransactionAndCheck(ix.ixs, false);
    await sendTransactionAndCheck(tx, "Fleet failed to exit subwarp");
    console.log(" ");
    console.log(`Exit subwarp completed!`);
    await sageGameHandler.getQuattrinoBalance();
  } catch (e) {
    throw e;
  }
};
