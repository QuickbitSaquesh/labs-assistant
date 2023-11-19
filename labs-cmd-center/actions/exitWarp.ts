import { sageProvider } from "../utils/sageProvider";

export const exitWarp = async (fleetName: string) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  const fleetPubkey = await sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  // Get the fleet account
  let fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);

  // Check that the fleet is warping, abort if not
  /* if (!fleetAccount.state.MoveWarp) {
    throw Error("fleet is expected to be in warp");
  } */

  // Instruct the fleet to exit warp
  let ix = await sageFleetHandler.ixReadyToExitWarp(fleetPubkey);
  let tx = await sageGameHandler.buildAndSignTransaction(ix);
  let rx = await sageGameHandler.sendTransaction(tx);

  // Check that the transaction was a success, if not abort
  if (!rx.value.isOk()) {
    throw Error("Fleet failed to exit warp");
  }

  console.log(" ");
  console.log(`Exit warp completed!`);
};
