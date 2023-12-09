import {
  StarbaseInfo,
  StarbaseInfoKey,
  findStarbaseNameByCoords,
} from "../../common/starbases";
import { SectorCoordinates } from "../../common/types";
import { setStarbaseAndResource } from "./setStarbaseAndResource";

export const setMiningInputs = async (position: SectorCoordinates) => {
  const fleetStarbaseName = findStarbaseNameByCoords(
    position
  ) as StarbaseInfoKey;

  const { starbase, resourceToMine } = await setStarbaseAndResource(
    fleetStarbaseName
  );

  return fleetStarbaseName === starbase
    ? {
        resourceToMine,
      }
    : {
        starbase: StarbaseInfo[starbase].coords,
        resourceToMine,
      };
};
