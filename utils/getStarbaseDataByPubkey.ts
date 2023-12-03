import { PublicKey } from "@solana/web3.js";
import { StarbaseData } from "../common/types";
import { sageProvider } from "./sageProvider";

export const getStarbaseDataByPubkey = async (
  starbasePubkey: PublicKey
): Promise<StarbaseData> => {
  const { sageFleetHandler } = await sageProvider();

  const starbaseAccount = await sageFleetHandler.getStarbaseAccount(
    starbasePubkey
  );

  return { starbasePubkey, starbaseAccount };
};
