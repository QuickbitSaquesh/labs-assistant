import { Resource, ResourceKey } from "../common/resources";
import {
  StarbaseCoords,
  StarbaseCoordsKey,
  findStarbaseNameByCoords,
} from "../common/starbases";
import { FleetDataWithSector, InputResourcesForCargo } from "../common/types";
import { askQuestion } from "./askQuestion";
import { getFleetData } from "./getFleetData";

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

export const inputForCargo = async () => {
  const fleetData = await getValidFleetData();
  const destinationStarbaseName = await getValidInput(
    "Enter the destination starbase: ",
    (input) => StarbaseCoords.hasOwnProperty(input)
  );

  const resourcesToDestination = await getValidResources(
    "Enter the resources you want to freight to starbase destination (ex: Carbon 5000, Lumanite 3000). Press enter to skip: "
  );
  const resourcesToStarbase = await getValidResources(
    "Enter the resources you want to freight to your current starbase (ex: Hydrogen 2000, IronOre 6000). Press enter to skip: "
  );

  return {
    fleetName: fleetData.fleetName,
    fleetData,
    sectorTo: StarbaseCoords[destinationStarbaseName],
    resourcesToDestination,
    resourcesToStarbase,
  };
};

async function getValidFleetData(): Promise<FleetDataWithSector> {
  while (true) {
    const fleetName = await askQuestion("Enter the fleet name: ");
    try {
      const fleetData = await getFleetData(fleetName);
      if (
        !fleetData.currentSector ||
        !fleetData.fleetAccount.state.StarbaseLoadingBay
      ) {
        console.log(
          "The fleet you chose is not in any starbase loading bay. Please try again.\n"
        );
        continue;
      }
      console.log(
        `Great. You have selected the fleet "${
          fleetData.fleetName
        }" located in ${
          findStarbaseNameByCoords(fleetData.currentSector) as StarbaseCoordsKey
        }\n`
      );
      return fleetData as FleetDataWithSector;
    } catch (e) {
      console.log("There is no fleet with this name. Please try again.\n");
    }
  }
}

async function getValidInput(
  promptMessage: string,
  validationFunction: (input: string) => boolean
): Promise<StarbaseCoordsKey> {
  while (true) {
    const input = await askQuestion(promptMessage);
    console.log("");
    if (validationFunction(input)) return input;
    console.log("Invalid input, please try again.\n");
  }
}

async function getValidResources(
  promptMessage: string
): Promise<InputResourcesForCargo[]> {
  while (true) {
    const resources = await askQuestion(promptMessage);
    console.log("");
    if (!resources) return [];
    const processedResources = await processInput(resources);
    if (processedResources.length > 0) return processedResources;
    console.log("Invalid resources, please try again.\n");
  }
}
