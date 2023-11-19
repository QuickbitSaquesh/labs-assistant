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
  await sageGameHandler.sendTransaction(tx);

  console.log("Fleet undocked!");
};
