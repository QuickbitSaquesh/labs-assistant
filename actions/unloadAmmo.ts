import { sageProvider } from "../utils/sageProvider";

export const unloadAmmo = async (fleetName: string, ammoAmount: number) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  // Get fleet public key
  let fleetPubkey = await sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  console.log(" ");
  console.log("Unloading ammo to fleet...");

  try {
    let ix = await sageFleetHandler.ixUnloadAmmoBanks(fleetPubkey, ammoAmount);
    if (!ix) return;
    let tx = await sageGameHandler.buildAndSignTransaction(ix);
    let rx = await sageGameHandler.sendTransaction(tx);

    // Check that the transaction was a success, if not abort
    if (!rx.value.isOk()) {
      throw Error("Fleet failed to unload ammo");
    }

    console.log("Fleet ammo unloaded!");
  } catch (e) {
    throw e;
  }
};
