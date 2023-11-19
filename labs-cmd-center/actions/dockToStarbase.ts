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
  await sageGameHandler.sendTransaction(tx);

  console.log("Fleet docked!");
};
