import { Resource, ResourceKey } from "../common/resources";
import {
  StarbaseCoords,
  StarbaseCoordsKey,
  findStarbaseNameByCoords,
} from "../common/starbases";
import { FleetData, InputResourcesForCargo } from "../common/types";
import { askQuestion } from "./askQuestion";
import { getFleetData } from "./getFleetData";

export const inputForCargo = async () => {
  let fleetName: string;
  let fleetData: FleetData;
  let resourcesToDestination: InputResourcesForCargo[];
  let resourcesToStarbase: InputResourcesForCargo[];

  let currentStarbaseName: StarbaseCoordsKey;
  let destinationStarbaseName: StarbaseCoordsKey;

  while (true) {
    fleetName = await askQuestion("Enter the fleet name: ");
    try {
      fleetData = await getFleetData(fleetName);
      if (
        !fleetData.currentSector ||
        !fleetData.fleetAccount.state.StarbaseLoadingBay
      ) {
        console.log(
          "The fleet you chose is not in any starbase loading bay. Please try again."
        );
        console.log("");
        continue;
      }
      currentStarbaseName = findStarbaseNameByCoords(
        fleetData.currentSector
      ) as StarbaseCoordsKey;
      console.log(
        `Great. You have selected the fleet "${fleetData.fleetName}" located in ${currentStarbaseName}`
      );
      console.log("");
    } catch (e) {
      console.log("There is no fleet with this name. Please try again.");
      console.log("");
      continue;
    }
    break;
  }

  while (true) {
    destinationStarbaseName = (await askQuestion(
      "Enter the destination starbase: "
    )) as StarbaseCoordsKey;
    console.log("");
    if (!StarbaseCoords[destinationStarbaseName]) continue;
    break;
  }

  while (true) {
    const resources = await askQuestion(
      "Enter the resources you want to freight to starbase destination (ex: Carbon 5000, Lumanite 3000). Press enter to skip: "
    );
    console.log("");
    if (!resources) break;
    resourcesToDestination = await processInput(resources);
    if (!resourcesToDestination || resourcesToDestination.length == 0) continue;
    break;
  }

  while (true) {
    const resources = await askQuestion(
      "Enter the resources you want to freight to your current starbase (ex: Hydrogen 2000, IronOre 6000). Press enter to skip: "
    );
    console.log("");
    if (!resources) break;
    resourcesToStarbase = await processInput(resources);
    if (!resourcesToStarbase || resourcesToStarbase.length == 0) continue;
    break;
  }

  return {
    fleetName,
    fleetData,
    sectorTo: StarbaseCoords[destinationStarbaseName],
    resourcesToDestination,
    resourcesToStarbase,
  };
};

async function processInput(input: string): Promise<InputResourcesForCargo[]> {
  const resourcePairs = input.split(",");
  const resources: InputResourcesForCargo[] = [];

  for (const pair of resourcePairs) {
    const regex = /(\w+)\s+(\d+)/;
    const match = regex.exec(pair.trim());

    if (match) {
      const resource = match[1] as ResourceKey;
      if (!Resource[resource]) return [];
      resources.push({
        resource: Resource[resource],
        amount: parseInt(match[2], 10),
      });
    } else {
      return [];
    }
  }

  return resources;
}
