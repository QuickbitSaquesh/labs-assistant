import { Resources } from "../common/resources";
import { sageProvider } from "../utils/sageProvider";

export const startMining = async (
  fleetName: string,
  resource: Resources,
  time: number
) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  // Get fleet public key
  let fleetPubkey = await sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  // Get the fleet account
  let fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);

  if (fleetAccount.state.Idle) {
    console.log(" ");
    console.log(`Start mining ${resource}...`);

    // Instruct the fleet to start mining
    let ix = await sageFleetHandler.ixStartMining(fleetPubkey, resource);
    let tx = await sageGameHandler.buildAndSignTransaction(ix);
    let rx = await sageGameHandler.sendTransaction(tx);

    // Check that the transaction was a success, if not abort
    if (!rx.value.isOk()) {
      throw Error(`Fleet failed to start mining ${resource}`);
    }

    console.log(`Mining started! Waiting for ${time} seconds...`);
    await new Promise((resolve) => setTimeout(resolve, time * 1000));
  }
};
