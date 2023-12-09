import { PublicKey } from "@solana/web3.js";
import { sageProvider } from "../utils/sageProvider";
import { buildAndSignTransactionAndCheck } from "../utils/transactions/buildAndSignTransactionAndCheck";
import { sendTransactionAndCheck } from "../utils/transactions/sendTransactionAndCheck";

export const unloadAmmo = async (
  fleetPubkey: PublicKey,
  ammoAmount: number
) => {
  const { sageGameHandler, sageFleetHandler } = await sageProvider();

  console.log(" ");
  console.log("Unloading ammo to fleet...");

  let ix = await sageFleetHandler.ixUnloadAmmoBanks(fleetPubkey, ammoAmount);
  if (ix.type !== "Success") {
    throw new Error(ix.type);
  }

  try {
    let tx = await buildAndSignTransactionAndCheck(ix.ixs, true);
    await sendTransactionAndCheck(tx, "Fleet failed to unload ammo");
    console.log("Fleet ammo unloaded!");
    await sageGameHandler.getQuattrinoBalance();
  } catch (e) {
    throw e;
  }
};
