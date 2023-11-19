import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { sageProvider } from "../utils/sageProvider";

export const loadAmmo = async (fleetName: string, ammoAmount: BN) => {
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
    console.log("Loading ammo to fleet...");

    const mintToken = sageGameHandler.mints?.ammo as PublicKey;
    const ammoBankToKey = fleetAccount.data.ammoBank;

    let ix = await sageFleetHandler.ixDepositCargoToFleet(
      fleetPubkey,
      ammoBankToKey,
      mintToken,
      ammoAmount
    );
    let tx = await sageGameHandler.buildAndSignTransaction(ix);
    let rx = await sageGameHandler.sendTransaction(tx);

    // Check that the transaction was a success, if not abort
    if (!rx.value.isOk()) {
      throw Error("Fleet failed to load ammo");
    }

    console.log("Fleet ammo loaded!");
  }
};
