import { BN } from "@project-serum/anchor";
import { SageGameHandler } from "..";
import { Resource, ResourceKey } from "../common/resources";
import {
  StarbaseCoords,
  StarbaseCoordsKey,
  findStarbaseNameByCoords,
} from "../common/starbases";
import { FleetDataWithSector, StarbaseResourceToMine } from "../common/types";
import { SageFleetHandler } from "./../src/sageFleetHandler";
import { askQuestion } from "./askQuestion";
import { getFleetData } from "./getFleetData";
import { getStarbaseDataByCoords } from "./getStarbaseDataByCoords";
import { sageProvider } from "./sageProvider";

export const inputForMining = async () => {
  const { sageFleetHandler, sageGameHandler } = await sageProvider();
  const fleetData = await getValidFleetData();

  const currentStarbaseName = findStarbaseNameByCoords(
    fleetData.currentSector
  ) as StarbaseCoordsKey;

  const { starbaseDestination, resourceToMine } = await getMiningInput(
    sageGameHandler,
    sageFleetHandler
  );

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
        sectorTo: StarbaseCoords[starbaseDestination],
      };
};

async function getMiningInput(
  sageGameHandler: SageGameHandler,
  sageFleetHandler: SageFleetHandler
): Promise<StarbaseResourceToMine> {
  while (true) {
    const input = await askQuestion(
      "Enter the starbase destination and the resource you want to mine (ex: MUD, Hydrogen): "
    );
    const [starbaseDestination, resourceToMine] = processInput(input) as [
      StarbaseCoordsKey,
      ResourceKey
    ];

    if (!StarbaseCoords[starbaseDestination] || !Resource[resourceToMine]) {
      console.log("Invalid starbase or resource. Please try again.\n");
      continue;
    }

    try {
      await verifyResourceAvailability(
        sageGameHandler,
        sageFleetHandler,
        starbaseDestination,
        resourceToMine
      );
      return { starbaseDestination, resourceToMine };
    } catch (e) {
      console.log(
        `It is not possible to mine ${resourceToMine} in ${findStarbaseNameByCoords(
          StarbaseCoords[starbaseDestination]
        )}\n`
      );
      continue;
    }
  }
}

async function verifyResourceAvailability(
  sageGameHandler: SageGameHandler,
  sageFleetHandler: SageFleetHandler,
  starbaseDestination: StarbaseCoordsKey,
  resourceToMine: ResourceKey
) {
  const { starbaseAccount } = await getStarbaseDataByCoords(
    StarbaseCoords[starbaseDestination]
  );
  const planetPubkey = await sageGameHandler.getPlanetAddress(
    starbaseAccount.data.sector as [BN, BN]
  );
  const mint = sageGameHandler.getResourceMintAddress(Resource[resourceToMine]);
  const mineItemPubkey = sageGameHandler.getMineItemAddress(mint);
  const resourcePubkey = sageGameHandler.getResrouceAddress(
    mineItemPubkey,
    planetPubkey
  );
  await sageFleetHandler.getResourceAccount(resourcePubkey);
}

async function getValidFleetData(): Promise<FleetDataWithSector> {
  while (true) {
    const fleetName = await askQuestion("Enter the fleet name: ");
    let currentStarbaseName: StarbaseCoordsKey;
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
      currentStarbaseName = findStarbaseNameByCoords(
        fleetData.currentSector
      ) as StarbaseCoordsKey;
      console.log(
        `Great. You have selected the fleet "${fleetData.fleetName}" located in ${currentStarbaseName}\n`
      );
      return fleetData as FleetDataWithSector;
    } catch (e) {
      console.log("There is no fleet with this name. Please try again.\n");
    }
  }
}

function processInput(input: string): [StarbaseCoordsKey, ResourceKey] {
  return input.split(",").map((s) => s.trim()) as [
    StarbaseCoordsKey,
    ResourceKey
  ];
}
