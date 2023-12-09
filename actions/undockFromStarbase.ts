import { PublicKey } from "@solana/web3.js";
import { sageProvider } from "../utils/sageProvider";
import { buildAndSignTransactionAndCheck } from "../utils/transactions/buildAndSignTransactionAndCheck";
import { sendTransactionAndCheck } from "../utils/transactions/sendTransactionAndCheck";

export const undockFromStarbase = async (fleetPubkey: PublicKey) => {
  const { sageGameHandler, sageFleetHandler } = await sageProvider();

  console.log(" ");
  console.log("Undocking from starbase...");

  let ix = await sageFleetHandler.ixUndockFromStarbase(fleetPubkey);
  if (ix.type !== "Success") {
    throw new Error(ix.type);
  }

  try {
    let tx = await buildAndSignTransactionAndCheck(ix.ixs, true);
    await sendTransactionAndCheck(tx, "Fleet failed to undock from starbase");
    console.log("Fleet undocked!");
    await sageGameHandler.getQuattrinoBalance();
  } catch (e) {
    throw e;
  }
};
