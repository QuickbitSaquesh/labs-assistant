import { Resources } from "../common/resources";
import { sageProvider } from "./sageProvider";

export const prepareForMining = async (
  fleetName: string,
  resource: Resources
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
      resource
    );

  return miningAssets;
};
