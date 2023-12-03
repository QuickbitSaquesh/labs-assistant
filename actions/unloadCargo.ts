import { BN } from "@project-serum/anchor";
import { ResourceType } from "../common/resources";
import { sageProvider } from "../utils/sageProvider";

export const unloadCargo = async (
  fleetName: string,
  resourceName: ResourceType,
  amount: BN
) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  const fleetPubkey = await sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  console.log(" ");
  console.log(`Unloading ${amount} ${resourceName} from fleet cargo...`);

  const mintToken = sageGameHandler.getResourceMintAddress(resourceName);

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
