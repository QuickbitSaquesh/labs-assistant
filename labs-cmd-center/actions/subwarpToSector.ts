import { BN } from "@project-serum/anchor";
import { sageProvider } from "../utils/sageProvider";

export const subwarpToSector = async (
  fleetName: string,
  x: number,
  y: number,
  time: number
) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  const fleetPubkey = await sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  // Get the fleet account
  let fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);
  //console.log(`Fleet state: ${JSON.stringify(fleetAccount.state)}`);

  console.log(" ");
  console.log(`Start subwarp...`);

  // Check that the fleet is idle, abort if not
  /* if (!fleetAccount.state.Idle) {
    throw Error("fleet is expected to be idle before warping");
  } */

  // Warp the fleet
  const sectorFrom = fleetAccount.state.Idle?.sector as [BN, BN]; // [0, 0]
  const sectorTo: [BN, BN] = [
    sectorFrom[0].add(new BN(x)),
    sectorFrom[1].add(new BN(y)),
  ]; // [1, 1]

  console.log(`Subwarp from - X: ${sectorFrom[0]} | Y: ${sectorFrom[1]}`);
  console.log(`Subwarp to - X: ${sectorTo[0]} | Y: ${sectorTo[1]}`);

  // Instruct the fleet to subwarp to coordinate
  let ix = await sageFleetHandler.ixSubwarpToCoordinate(fleetPubkey, sectorTo);
  let tx = await sageGameHandler.buildAndSignTransaction(ix);
  let rx = await sageGameHandler.sendTransaction(tx);

  // Check that the transaction was a success, if not abort
  if (!rx.value.isOk()) {
    throw Error("Fleet failed to subwarp");
  }

  console.log(`Waiting for ${time} seconds...`);
  await new Promise((resolve) => setTimeout(resolve, time * 1000));

  console.log(`Subwarp completed!`);
};
