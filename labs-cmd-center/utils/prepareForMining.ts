import { ResourceType } from "../common/resources";
import { SectorCoordinates } from "../common/types";
import { sageProvider } from "./sageProvider";

export const prepareForMining = async (
  fleetName: string,
  resourceName: ResourceType,
  starbaseCoords: SectorCoordinates
) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  const fleetPubkey = sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  const miningAssets =
    await sageFleetHandler.getTimeAndNeededResourcesToFullCargoInMining(
      fleetPubkey,
      resourceName,
      starbaseCoords
    );

  return miningAssets;
};
