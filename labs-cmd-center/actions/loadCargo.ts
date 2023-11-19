import { BN } from "@project-serum/anchor";
import { Resources } from "../common/resources";
import { sageProvider } from "../utils/sageProvider";

export const loadCargo = async (
  fleetName: string,
  resourceName: Resources,
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
    console.log("Loading cargo to fleet...");

    const mintToken = sageGameHandler.getResourceMintAddress(resourceName);
    const cargoPodToKey = fleetAccount.data.cargoHold;

    let ix = await sageFleetHandler.ixDepositCargoToFleet(
      fleetPubkey,
      cargoPodToKey,
      mintToken,
      amount
    );
    let tx = await sageGameHandler.buildAndSignTransaction(ix);
    await sageGameHandler.sendTransaction(tx);

    console.log("Fleet cargo loaded!");
  }
};
