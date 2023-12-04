import {
  StarbaseInfo,
  StarbaseInfoKey,
  findStarbaseNameByCoords,
} from "../common/starbases";
import { getMiningStarbaseAndResource } from "./getMiningStarbaseAndResource";
import { getValidFleetData } from "./getValidFleetData";

export const inputForMining = async () => {
  const fleetData = await getValidFleetData();

  const currentStarbaseName = findStarbaseNameByCoords(
    fleetData.currentSector
  ) as StarbaseInfoKey;

  const { starbaseDestination, resourceToMine } =
    await getMiningStarbaseAndResource(currentStarbaseName);

  return currentStarbaseName === starbaseDestination
    ? {
        fleetName: fleetData.fleetName,
        fleetData,
        resourceToMine,
      }
    : {
        fleetName: fleetData.fleetName,
        fleetData,
        resourceToMine,
        sectorTo: StarbaseInfo[starbaseDestination].coords,
      };
};
