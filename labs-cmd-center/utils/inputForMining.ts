import { BN } from "@project-serum/anchor";
import { Resource, ResourceKey } from "../common/resources";
import {
  StarbaseCoords,
  StarbaseCoordsKey,
  findStarbaseNameByCoords,
} from "../common/starbases";
import { FleetData } from "../common/types";
import { askQuestion } from "./askQuestion";
import { getFleetData } from "./getFleetData";
import { getStarbaseDataByCoords } from "./getStarbaseDataByCoords";
import { sageProvider } from "./sageProvider";

export const inputForMining = async () => {
  const { sageFleetHandler, sageGameHandler } = await sageProvider();

  let fleetName: string;
  let fleetData: FleetData;

  let currentStarbaseName: StarbaseCoordsKey;
  let starbaseDestinationAndResourceToMine: [StarbaseCoordsKey, ResourceKey];

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
    const input = await askQuestion(
      "Enter the starbase destination and the resource you want to mine (ex: MUD, Hydrogen): "
    );
    console.log("");
    starbaseDestinationAndResourceToMine = processInput(input) as [
      StarbaseCoordsKey,
      ResourceKey
    ];
    if (!StarbaseCoords[starbaseDestinationAndResourceToMine[0]]) continue;
    if (!Resource[starbaseDestinationAndResourceToMine[1]]) continue;
    const starbaseDestination = starbaseDestinationAndResourceToMine[0];
    const resourceToMine = starbaseDestinationAndResourceToMine[1];

    const { starbaseAccount } = await getStarbaseDataByCoords(
      StarbaseCoords[starbaseDestination]
    );
    const planetPubkey = await sageGameHandler.getPlanetAddress(
      starbaseAccount.data.sector as [BN, BN]
    );
    const mint = sageGameHandler.getResourceMintAddress(
      Resource[resourceToMine]
    );
    const mineItemPubkey = await sageGameHandler.getMineItemAddress(mint);
    const resourcePubkey = sageGameHandler.getResrouceAddress(
      mineItemPubkey,
      planetPubkey
    );
    try {
      await sageFleetHandler.getResourceAccount(resourcePubkey);
      break;
    } catch (e) {
      console.log(
        `It is not possible to mine ${
          Resource[resourceToMine]
        } in ${findStarbaseNameByCoords(StarbaseCoords[starbaseDestination])}`
      );
      console.log("");
      continue;
    }
  }

  return currentStarbaseName === starbaseDestinationAndResourceToMine[0]
    ? {
        fleetName,
        fleetData,
        resourceToMine: starbaseDestinationAndResourceToMine[1],
      }
    : {
        fleetName,
        fleetData,
        resourceToMine: starbaseDestinationAndResourceToMine[1],
        sectorTo: StarbaseCoords[starbaseDestinationAndResourceToMine[0]],
      };
};

const processInput = (input: string) => {
  const splittedInput = input.split(",");
  const trimmedSplit = splittedInput.map((item) => item.trim());
  return trimmedSplit;
};
