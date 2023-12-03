import { BN } from "@project-serum/anchor";
import { FleetData, SectorCoordinates } from "../common/types";
import { getStarbaseDataByPubkey } from "./getStarbaseDataByPubkey";
import { sageProvider } from "./sageProvider";

export const getFleetData = async (fleetName: string): Promise<FleetData> => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  const fleetPubkey = sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  const fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);

  let coordinates;

  if (fleetAccount.state.MoveSubwarp) {
    coordinates = fleetAccount.state.MoveSubwarp
      .currentSector as SectorCoordinates;
  }
  if (fleetAccount.state.StarbaseLoadingBay) {
    coordinates = (
      await getStarbaseDataByPubkey(
        fleetAccount.state.StarbaseLoadingBay.starbase
      )
    ).starbaseAccount.data.sector as SectorCoordinates;
    coordinates = [
      new BN(parseInt(coordinates[0], 10)),
      new BN(parseInt(coordinates[1], 10)),
    ] as SectorCoordinates;
  }
  if (fleetAccount.state.Idle) {
    coordinates = fleetAccount.state.Idle.sector as SectorCoordinates;
  }

  return { fleetName, fleetPubkey, fleetAccount, currentSector: coordinates };
};
