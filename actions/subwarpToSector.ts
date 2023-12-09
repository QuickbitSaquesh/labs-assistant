import { PublicKey } from "@solana/web3.js";
import { SectorCoordinates } from "../common/types";
import { wait } from "../utils/actions/wait";
import { sageProvider } from "../utils/sageProvider";
import { buildAndSignTransactionAndCheck } from "../utils/transactions/buildAndSignTransactionAndCheck";
import { sendTransactionAndCheck } from "../utils/transactions/sendTransactionAndCheck";

export const subwarpToSector = async (
  fleetPubkey: PublicKey,
  distanceCoords: SectorCoordinates
) => {
  const { sageGameHandler, sageFleetHandler } = await sageProvider();

  console.log(" ");
  console.log(`Start subwarp...`);

  let ix = await sageFleetHandler.ixSubwarpToCoordinate(
    fleetPubkey,
    distanceCoords
  );
  if (ix.type !== "Success") {
    throw new Error(ix.type);
  }

  try {
    let tx = await buildAndSignTransactionAndCheck(ix.ixs, true);
    await sendTransactionAndCheck(tx, "Fleet failed to subwarp");
    console.log(`Waiting for ${ix.timeToSubwarp} seconds...`);
    await sageGameHandler.getQuattrinoBalance();
    await wait(ix.timeToSubwarp);
    console.log(`Subwarp completed!`);
  } catch (e) {
    throw e;
  }
};
