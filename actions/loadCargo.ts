import { PublicKey } from "@solana/web3.js";
import { ResourceType } from "../common/resources";
import { sageProvider } from "../utils/sageProvider";
import { buildAndSignTransactionAndCheck } from "../utils/transactions/buildAndSignTransactionAndCheck";
import { sendTransactionAndCheck } from "../utils/transactions/sendTransactionAndCheck";

export const loadCargo = async (
  fleetPubkey: PublicKey,
  resourceName: ResourceType,
  amount: number
) => {
  const { sageGameHandler, sageFleetHandler } = await sageProvider();

  console.log(" ");
  console.log(`Loading ${amount} ${resourceName} to fleet cargo...`);

  const mintToken = sageGameHandler.getResourceMintAddress(resourceName);

  let ix = await sageFleetHandler.ixDepositCargoToFleet(
    fleetPubkey,
    mintToken,
    amount
  );
  switch (ix.type) {
    case "FleetCargoIsFull":
      console.log("Your fleet cargo is full");
      return;
    default:
      if (ix.type !== "Success") {
        throw new Error(ix.type);
      }
  }

  try {
    let tx = await buildAndSignTransactionAndCheck(ix.ixs);
    await sendTransactionAndCheck(tx, "Fleet failed to load cargo");
    console.log("Fleet cargo loaded!");
    await sageGameHandler.getQuattrinoBalance();
  } catch (e) {
    throw e;
  }
};
