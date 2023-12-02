import { BN } from "@project-serum/anchor";
import { ResourcesType } from "../common/resources";
import { sageProvider } from "./sageProvider";

export const prepareForMining = async (
  fleetName: string,
  resource: ResourcesType,
  starbaseCoordinates: [number, number]
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
      resource,
      [new BN(starbaseCoordinates[0]), new BN(starbaseCoordinates[1])]
    );

  return miningAssets;
};
