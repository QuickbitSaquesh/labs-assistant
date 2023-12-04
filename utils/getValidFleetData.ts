import inquirer from "inquirer";
import { StarbaseInfoKey, findStarbaseNameByCoords } from "../common/starbases";
import { FleetDataWithSector } from "../common/types";
import { getFleetData } from "./getFleetData";

export const getValidFleetData = async (): Promise<FleetDataWithSector> => {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "fleetName",
      message: "Enter the fleet name:",
      validate: async (input) => {
        try {
          const fleetData = await getFleetData(input);
          if (
            !fleetData.currentSector ||
            !fleetData.fleetAccount.state.StarbaseLoadingBay
          ) {
            return "The fleet is not in any starbase loading bay. Please enter a valid fleet name.";
          }
          return true;
        } catch (e) {
          return "There is no fleet with this name. Please enter a valid fleet name.";
        }
      },
    },
  ]);

  const fleetData = (await getFleetData(
    answers.fleetName
  )) as FleetDataWithSector;

  const currentStarbaseName = findStarbaseNameByCoords(
    fleetData.currentSector
  ) as StarbaseInfoKey;

  console.log(
    `Great. You have selected the fleet "${fleetData.fleetName}" located in ${currentStarbaseName}\n`
  );
  return fleetData;
};
