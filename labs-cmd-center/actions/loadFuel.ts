import { sageProvider } from "../utils/sageProvider";

export const loadFuel = async (fleetName: string, fuelAmount: number) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  // Get fleet public key
  let fleetPubkey = await sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  console.log(" ");
  console.log("Loading fuel to fleet...");

  try {
    let ix = await sageFleetHandler.ixRefuelFleet(fleetPubkey, fuelAmount);
    if (!ix) return;
    let tx = await sageGameHandler.buildAndSignTransaction(ix);
    let rx = await sageGameHandler.sendTransaction(tx);

    // Check that the transaction was a success, if not abort
    if (!rx.value.isOk()) {
      throw Error("Fleet failed to load fuel");
    }

    console.log("Fleet fuel loaded!");
  } catch (e) {
    throw e;
  }
};
