import { sageProvider } from "../utils/sageProvider";

export const loadAmmo = async (fleetName: string, ammoAmount: number) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  // Get fleet public key
  let fleetPubkey = await sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  console.log(" ");
  console.log("Loading ammo to fleet...");

  try {
    let ix = await sageFleetHandler.ixRearmFleet(fleetPubkey, ammoAmount);
    if (!ix) return;
    let tx = await sageGameHandler.buildAndSignTransaction(ix);
    let rx = await sageGameHandler.sendTransaction(tx);

    // Check that the transaction was a success, if not abort
    if (!rx.value.isOk()) {
      throw Error("Fleet failed to load ammo");
    }

    console.log("Fleet ammo loaded!");
  } catch (e) {
    throw e;
  }
};
