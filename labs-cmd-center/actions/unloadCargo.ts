import { BN } from "@project-serum/anchor";
import { Resources } from "../common/resources";
import { sageProvider } from "../utils/sageProvider";

export const unloadCargo = async (
  fleetName: string,
  resource: Resources,
  amount: BN
) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  const fleetPubkey = await sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  let fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);

  if (fleetAccount.state.StarbaseLoadingBay) {
    console.log(" ");
    console.log("Unloading cargo from fleet...");

    const mintToken = sageGameHandler.getResourceMintAddress(resource);

    let ix = await sageFleetHandler.ixWithdrawCargoFromFleet(
      fleetPubkey,
      mintToken,
      amount
    );
    let tx = await sageGameHandler.buildAndSignTransaction(ix);
    await sageGameHandler.sendTransaction(tx);

    console.log("Fleet cargo unloaded!");
  }
};
