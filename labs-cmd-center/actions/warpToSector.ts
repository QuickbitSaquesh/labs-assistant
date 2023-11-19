import { BN } from "@project-serum/anchor";
import { sageProvider } from "../utils/sageProvider";

export const warpToSector = async (
  fleetName: string,
  x: number,
  y: number,
  time: number,
  cooldown: number,
  waitCooldown: boolean
) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  const fleetPubkey = await sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  // Get the fleet account
  let fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);

  console.log(" ");
  console.log(`Start warp...`);

  // Check that the fleet is idle, abort if not
  if (!fleetAccount.state.Idle) {
    throw Error("fleet is expected to be idle before warping");
  }

  // Warp the fleet
  const sectorFrom = fleetAccount.state.Idle?.sector as [BN, BN]; // [0, 0]
  const sectorTo: [BN, BN] = [
    sectorFrom[0].add(new BN(x)),
    sectorFrom[1].add(new BN(y)),
  ]; // [1, 1]

  console.log(`Warp From - X: ${sectorFrom[0]} | Y: ${sectorFrom[1]}`);
  console.log(`Warp To - X: ${sectorTo[0]} | Y: ${sectorTo[1]}`);

  // Instruct the fleet to warp to coordinate
  let ix = await sageFleetHandler.ixWarpToCoordinate(fleetPubkey, sectorTo);
  let tx = await sageGameHandler.buildAndSignTransaction(ix);
  let rx = await sageGameHandler.sendTransaction(tx);

  // Check that the transaction was a success, if not abort
  if (!rx.value.isOk()) {
    throw Error("fleet failed to warp");
  }

  // Get the fleet account (update)
  fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);
  //console.log(`Fleet state: ${JSON.stringify(fleetAccount.state)}`);

  console.log(" ");
  console.log(`Waiting for ${time} seconds...`);
  await new Promise((resolve) => setTimeout(resolve, time * 1000));

  // Instruct the fleet to exit warp
  ix = await sageFleetHandler.ixReadyToExitWarp(fleetPubkey);
  tx = await sageGameHandler.buildAndSignTransaction(ix);
  rx = await sageGameHandler.sendTransaction(tx);

  // Check that the transaction was a success, if not abort
  if (!rx.value.isOk()) {
    throw Error("fleet failed to exit warp");
  }

  // Get the fleet account (update)
  fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);
  //console.log(`Fleet state: ${JSON.stringify(fleetAccount.state)}`);

  console.log(" ");
  console.log(`Stop warp...`);

  if (waitCooldown) {
    console.log(`Waiting for ${cooldown} seconds...`);
    await new Promise((resolve) => setTimeout(resolve, cooldown * 1000));
  }
};
