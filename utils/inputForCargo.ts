import {
  StarbaseInfo,
  StarbaseInfoKey,
  findStarbaseNameByCoords,
} from "../common/starbases";
import { getStarbaseDestination } from "./getStarbaseDestination";
import { getValidFleetData } from "./getValidFleetData";
import { getValidResources } from "./getValidResources";

export const inputForCargo = async () => {
  const fleetData = await getValidFleetData();

  const currentStarbaseName = findStarbaseNameByCoords(
    fleetData.currentSector
  ) as StarbaseInfoKey;

  const starbaseDestination = await getStarbaseDestination(
    currentStarbaseName,
    true
  );

  const resourcesToDestination = await getValidResources(
    "Enter resources for starbase destination (e.g., Carbon 5000), or press enter to skip:"
  );
  const resourcesToStarbase = await getValidResources(
    "Enter resources for current starbase (ex: Hydrogen 2000). Press enter to skip:"
  );

  return {
    fleetName: fleetData.fleetName,
    fleetData,
    sectorTo: StarbaseInfo[starbaseDestination].coords,
    resourcesToDestination,
    resourcesToStarbase,
  };
};
