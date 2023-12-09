import { PublicKey } from "@solana/web3.js";
import { sageProvider } from "../utils/sageProvider";
import { buildAndSignTransactionAndCheck } from "../utils/transactions/buildAndSignTransactionAndCheck";
import { sendTransactionAndCheck } from "../utils/transactions/sendTransactionAndCheck";

export const loadAmmo = async (fleetPubkey: PublicKey, ammoAmount: number) => {
  const { sageGameHandler, sageFleetHandler } = await sageProvider();

  console.log(" ");
  console.log("Loading ammo to fleet...");

  let ix = await sageFleetHandler.ixRearmFleet(fleetPubkey, ammoAmount);
  switch (ix.type) {
    case "FleetAmmoBankIsFull":
      console.log("Your fleet ammo bank is already full");
      return;
    default:
      if (ix.type !== "Success") {
        throw new Error(ix.type);
      }
  }

  try {
    let tx = await buildAndSignTransactionAndCheck(ix.ixs);
    await sendTransactionAndCheck(tx, "Fleet failed to load ammo");
    console.log("Fleet ammo loaded!");
    await sageGameHandler.getQuattrinoBalance();
  } catch (e) {
    throw e;
  }
};
