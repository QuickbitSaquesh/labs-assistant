import { BN } from "@project-serum/anchor";
import { FleetData } from "../common/types";
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
    coordinates = fleetAccount.state.MoveSubwarp.currentSector as [BN, BN];
  }
  if (fleetAccount.state.StarbaseLoadingBay) {
    coordinates = (
      await getStarbaseDataByPubkey(
        fleetAccount.state.StarbaseLoadingBay.starbase
      )
    ).starbaseAccount.data.sector as [BN, BN];
    coordinates = [
      parseInt(coordinates[0], 10),
      parseInt(coordinates[1], 10),
    ] as [BN, BN];
  }
  if (fleetAccount.state.Idle) {
    coordinates = fleetAccount.state.Idle.sector as [BN, BN];
  }

  return { fleetName, fleetPubkey, fleetAccount, currentSector: coordinates };
};
