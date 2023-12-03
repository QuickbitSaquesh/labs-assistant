import { Resources } from "../common/resources";
import { sageProvider } from "../utils/sageProvider";

export const stopMining = async (fleetName: string, resource: Resources) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  // Get fleet public key
  let fleetPubkey = await sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  // Get the fleet account
  let fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);

  if (fleetAccount.state.MineAsteroid) {
    console.log(" ");
    console.log(`Stop mining ${resource}...`);

    // Instruct the fleet to stop mining
    let ix = await sageFleetHandler.ixStopMining(fleetPubkey);
    let tx = await sageGameHandler.buildAndSignTransaction(ix);
    let rx = await sageGameHandler.sendTransaction(tx);

    // Check that the transaction was a success, if not abort
    if (!rx.value.isOk()) {
      throw Error("Fleet failed to stop mining");
    }

    console.log(`Mining stopped!`);
  }
};
