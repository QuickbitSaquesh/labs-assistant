import inquirer from "inquirer";
import { ResourceKey } from "../common/resources";
import { StarbaseInfo, StarbaseInfoKey } from "../common/starbases";
import { StarbaseResourceToMine } from "../common/types";
import { getStarbaseDestination } from "./getStarbaseDestination";

export const getMiningStarbaseAndResource = async (
  currentStarbase: StarbaseInfoKey
): Promise<StarbaseResourceToMine> => {
  const starbaseDestination = await getStarbaseDestination(currentStarbase);

  const resourceAnswer = await inquirer.prompt([
    {
      type: "list",
      name: "resourceToMine",
      message: "Choose the resource to mine:",
      choices: StarbaseInfo[starbaseDestination].resourcesToMine,
    },
  ]);

  const resourceToMine = resourceAnswer.resourceToMine as ResourceKey;

  return { starbaseDestination, resourceToMine };
};
