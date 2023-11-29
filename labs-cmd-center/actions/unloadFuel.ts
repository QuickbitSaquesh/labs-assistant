import { sageProvider } from "../utils/sageProvider";

export const unloadFuel = async (fleetName: string, fuelAmount: number) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  // Get fleet public key
  let fleetPubkey = await sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  console.log(" ");
  console.log("Unloading fuel to fleet...");

  try {
    let ix = await sageFleetHandler.ixUnloadFuelTanks(fleetPubkey, fuelAmount);
    if (!ix) return;
    let tx = await sageGameHandler.buildAndSignTransaction(ix);
    let rx = await sageGameHandler.sendTransaction(tx);

    // Check that the transaction was a success, if not abort
    if (!rx.value.isOk()) {
      throw Error("Fleet failed to unload fuel");
    }

    console.log("Fleet fuel unloaded!");
  } catch (e) {
    throw e;
  }
};
