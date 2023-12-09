import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { ResourceType } from "../common/resources";
import { sageProvider } from "../utils/sageProvider";
import { buildAndSignTransactionAndCheck } from "../utils/transactions/buildAndSignTransactionAndCheck";
import { sendTransactionAndCheck } from "../utils/transactions/sendTransactionAndCheck";

export const unloadCargo = async (
  fleetPubkey: PublicKey,
  resourceName: ResourceType,
  amount: BN
) => {
  const { sageGameHandler, sageFleetHandler } = await sageProvider();

  console.log(" ");
  console.log(`Unloading ${amount} ${resourceName} from fleet cargo...`);

  const mintToken = sageGameHandler.getResourceMintAddress(resourceName);

  let ix = await sageFleetHandler.ixWithdrawCargoFromFleet(
    fleetPubkey,
    mintToken,
    amount
  );
  if (ix.type !== "Success") {
    throw new Error(ix.type);
  }

  try {
    let tx = await buildAndSignTransactionAndCheck(ix.ixs);
    await sendTransactionAndCheck(tx, "Fleet failed to unload cargo");
    console.log("Fleet cargo unloaded!");
    await sageGameHandler.getQuattrinoBalance();
  } catch (e) {
    throw e;
  }
};
