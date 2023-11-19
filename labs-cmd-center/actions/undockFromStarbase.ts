import { sageProvider } from "../utils/sageProvider";

export const undockFromStarbase = async (fleetName: string) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  const fleetPubkey = await sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  // Instruct the fleet to dock to the starbase
  console.log(" ");
  console.log("Undocking from starbase...");

  let ix = await sageFleetHandler.ixUndockFromStarbase(fleetPubkey);
  let tx = await sageGameHandler.buildAndSignTransaction(ix);
  let rx = await sageGameHandler.sendTransaction(tx);

  // Check that the transaction was a success, if not abort
  if (!rx.value.isOk()) {
    throw Error("Fleet failed to undock from starbase");
  }

  console.log("Fleet undocked!");
};
