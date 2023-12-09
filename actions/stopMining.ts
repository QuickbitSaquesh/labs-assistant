import { PublicKey } from "@solana/web3.js";
import { sageProvider } from "../utils/sageProvider";
import { buildAndSignTransactionAndCheck } from "../utils/transactions/buildAndSignTransactionAndCheck";
import { sendTransactionAndCheck } from "../utils/transactions/sendTransactionAndCheck";

export const stopMining = async (fleetPubkey: PublicKey, resource: string) => {
  const { sageGameHandler, sageFleetHandler } = await sageProvider();

  console.log(" ");
  console.log(`Stop mining ${resource}...`);

  let ix = await sageFleetHandler.ixStopMining(fleetPubkey);
  if (ix.type !== "Success") {
    throw new Error(ix.type);
  }

  let tx = await buildAndSignTransactionAndCheck(ix.ixs, false);
  await sendTransactionAndCheck(tx, "Fleet failed to stop mining");
  console.log(`Mining stopped!`);
  await sageGameHandler.getQuattrinoBalance();
};
