import { sageProvider } from "../utils/sageProvider";

export const dockToStarbase = async (fleetName: string) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  const fleetPubkey = await sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  // Instruct the fleet to dock to the starbase
  console.log(" ");
  console.log("Docking to starbase...");

  let ix = await sageFleetHandler.ixDockToStarbase(fleetPubkey);
  let tx = await sageGameHandler.buildAndSignTransaction(ix);
  let rx = await sageGameHandler.sendTransaction(tx);

  // Check that the transaction was a success, if not abort
  if (!rx.value.isOk()) {
    throw Error("Fleet failed to dock to starbase");
  }

  console.log("Fleet docked!");
};
