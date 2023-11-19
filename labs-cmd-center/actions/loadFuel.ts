import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { sageProvider } from "../utils/sageProvider";

export const loadFuel = async (fleetName: string, fuelAmount: BN) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  // Get fleet public key
  let fleetPubkey = await sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  // Get the fleet account
  let fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);

  if (fleetAccount.state.StarbaseLoadingBay) {
    console.log(" ");
    console.log("Loading fuel to fleet...");

    const mintToken = sageGameHandler.mints?.fuel as PublicKey;
    const fuelTankToKey = fleetAccount.data.fuelTank;

    let ix = await sageFleetHandler.ixDepositCargoToFleet(
      fleetPubkey,
      fuelTankToKey,
      mintToken,
      fuelAmount
    );
    let tx = await sageGameHandler.buildAndSignTransaction(ix);
    let rx = await sageGameHandler.sendTransaction(tx);

    // Check that the transaction was a success, if not abort
    if (!rx.value.isOk()) {
      throw Error("Fleet failed to load fuel");
    }

    console.log("Fleet fuel loaded!");
  }
};
