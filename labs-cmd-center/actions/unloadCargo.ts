import { BN } from "@project-serum/anchor";
import { Resources } from "../common/resources";
import { sageProvider } from "../utils/sageProvider";

export const unloadCargo = async (
  fleetName: string,
  resource: Resources,
  amount: BN
) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  const fleetPubkey = await sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  console.log(" ");
  console.log("Unloading cargo from fleet...");

  const mintToken = sageGameHandler.getResourceMintAddress(resource);

  try {
    let ix = await sageFleetHandler.ixWithdrawCargoFromFleet(
      fleetPubkey,
      mintToken,
      amount
    );
    if (ix.type != "Success") throw new Error(ix.type);

    let tx = await sageGameHandler.buildAndSignTransaction(ix.ixs);

    let rx = await sageGameHandler.sendTransaction(tx);
    if (!rx.value.isOk()) throw Error("FleetFailedToUnloadCargo");

    console.log("Fleet cargo unloaded!");
  } catch (e) {
    throw e;
  }
};
