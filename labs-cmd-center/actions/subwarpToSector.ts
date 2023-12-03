import { SectorCoordinates } from "../common/types";
import { sageProvider } from "../utils/sageProvider";

export const subwarpToSector = async (
  fleetName: string,
  distanceCoords: SectorCoordinates
) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  const fleetPubkey = await sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  let fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);

  console.log(" ");
  console.log(`Start subwarp...`);

  const sectorFrom = fleetAccount.state.Idle?.sector as SectorCoordinates;
  const sectorTo: SectorCoordinates = [
    sectorFrom[0].add(distanceCoords[0]),
    sectorFrom[1].add(distanceCoords[1]),
  ];

  console.log(`Subwarp from - X: ${sectorFrom[0]} | Y: ${sectorFrom[1]}`);
  console.log(`Subwarp to - X: ${sectorTo[0]} | Y: ${sectorTo[1]}`);

  if (sectorFrom[0].eq(sectorTo[0]) && sectorFrom[1].eq(sectorTo[1])) return;

  const timeToSubwarp = await sageFleetHandler.getTimeToSubwarp(
    fleetPubkey,
    sectorFrom,
    sectorTo
  );

  let ix = await sageFleetHandler.ixSubwarpToCoordinate(fleetPubkey, sectorTo);
  let tx = await sageGameHandler.buildAndSignTransaction(ix);
  let rx = await sageGameHandler.sendTransaction(tx);

  if (!rx.value.isOk()) {
    throw Error("Fleet failed to subwarp");
  }

  console.log(`Waiting for ${timeToSubwarp} seconds...`);
  await new Promise((resolve) => setTimeout(resolve, timeToSubwarp * 1000));

  console.log(`Subwarp completed!`);
};
