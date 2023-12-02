import { BN } from "@project-serum/anchor";
import { sageProvider } from "../utils/sageProvider";

export const subwarpToSector = async (
  fleetName: string,
  destinationCoords: [number, number]
) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  const fleetPubkey = await sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  // Get the fleet account
  let fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);
  //console.log(`Fleet state: ${JSON.stringify(fleetAccount.state)}`);

  console.log(" ");
  console.log(`Start subwarp...`);

  // Subwarp the fleet
  const sectorFrom = fleetAccount.state.Idle?.sector as [BN, BN]; // [0, 0]
  const sectorTo = [
    new BN(destinationCoords[0]),
    new BN(destinationCoords[1]),
  ] as [BN, BN];

  console.log(`Subwarp from - X: ${sectorFrom[0]} | Y: ${sectorFrom[1]}`);
  console.log(`Subwarp to - X: ${sectorTo[0]} | Y: ${sectorTo[1]}`);

  if (sectorFrom[0].eq(sectorTo[0]) && sectorFrom[1].eq(sectorTo[1])) return;

  const timeToSubwarp = await sageFleetHandler.getTimeToSubwarp(
    fleetPubkey,
    sectorFrom,
    sectorTo
  );

  // Instruct the fleet to subwarp to coordinate
  let ix = await sageFleetHandler.ixSubwarpToCoordinate(fleetPubkey, sectorTo);
  let tx = await sageGameHandler.buildAndSignTransaction(ix);
  let rx = await sageGameHandler.sendTransaction(tx);

  // Check that the transaction was a success, if not abort
  if (!rx.value.isOk()) {
    throw Error("Fleet failed to subwarp");
  }

  console.log(`Waiting for ${timeToSubwarp} seconds...`);
  await new Promise((resolve) => setTimeout(resolve, timeToSubwarp * 1000));

  console.log(`Subwarp completed!`);
};
