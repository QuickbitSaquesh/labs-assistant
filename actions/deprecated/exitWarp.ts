import { PublicKey } from "@solana/web3.js";
import { sageProvider } from "../utils/sageProvider";
import { buildAndSignTransactionAndCheck } from "../utils/transactions/buildAndSignTransactionAndCheck";
import { sendTransactionAndCheck } from "../utils/transactions/sendTransactionAndCheck";

// TODO: Need refactoring - current version is deprecated
export const exitWarp = async (fleetPubkey: PublicKey) => {
  const { sageFleetHandler } = await sageProvider();

  // TODO: move to ix
  let fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);
  if (!fleetAccount.state.MoveWarp) return;

  // Instruct the fleet to exit warp
  let ix = await sageFleetHandler.ixReadyToExitWarp(fleetPubkey);
  if (!ix) return;
  let tx = await buildAndSignTransactionAndCheck(ix, true);
  await sendTransactionAndCheck(tx, "Fleet failed to exit warp");

  console.log(" ");
  console.log(`Exit warp completed!`);
};
