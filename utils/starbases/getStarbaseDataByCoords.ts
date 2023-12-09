import { BN } from "@project-serum/anchor";
import { StarbaseData } from "../../common/types";
import { sageProvider } from "../sageProvider";

export const getStarbaseDataByCoords = async (
  coordinates: [BN, BN]
): Promise<StarbaseData> => {
  const { sageGameHandler, sageFleetHandler } = await sageProvider();

  const starbasePubkey = sageGameHandler.getStarbaseAddress(coordinates);
  const starbaseAccount = await sageFleetHandler.getStarbaseAccount(
    starbasePubkey
  );

  return { starbasePubkey, starbaseAccount };
};
