import { PublicKey } from "@solana/web3.js";
import { sageProvider } from "../utils/sageProvider";
import { buildAndSignTransactionAndCheck } from "../utils/transactions/buildAndSignTransactionAndCheck";
import { sendTransactionAndCheck } from "../utils/transactions/sendTransactionAndCheck";

export const unloadFuel = async (
  fleetPubkey: PublicKey,
  fuelAmount: number
) => {
  const { sageGameHandler, sageFleetHandler } = await sageProvider();

  console.log(" ");
  console.log("Unloading fuel to fleet...");

  let ix = await sageFleetHandler.ixUnloadFuelTanks(fleetPubkey, fuelAmount);
  if (ix.type !== "Success") {
    throw new Error(ix.type);
  }

  try {
    let tx = await buildAndSignTransactionAndCheck(ix.ixs, true);
    await sendTransactionAndCheck(tx, "Fleet failed to unload fuel");
    console.log("Fleet fuel unloaded!");
    await sageGameHandler.getQuattrinoBalance();
  } catch (e) {
    throw e;
  }
};
