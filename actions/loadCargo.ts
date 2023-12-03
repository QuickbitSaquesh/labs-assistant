import { ResourceType } from "../common/resources";
import { sageProvider } from "../utils/sageProvider";

export const loadCargo = async (
  fleetName: string,
  resourceName: ResourceType,
  amount: number
) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  const fleetPubkey = await sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  console.log(" ");
  console.log(`Loading ${amount} ${resourceName} to fleet cargo...`);

  const mintToken = sageGameHandler.getResourceMintAddress(resourceName);

  try {
    let ix = await sageFleetHandler.ixDepositCargoToFleet(
      fleetPubkey,
      mintToken,
      amount
    );
    if (ix.type == "FleetCargoIsFull") {
      console.log("Your fleet cargo is full");
      return;
    } else if (ix.type == "StarbaseCargoPodTokenAccountNotFound") {
      console.log("Not enough resources in starbase");
      return;
    } else if (ix.type != "Success") throw new Error(ix.type);

    let tx = await sageGameHandler.buildAndSignTransaction(ix.ixs);

    let rx = await sageGameHandler.sendTransaction(tx);
    if (!rx.value.isOk()) throw Error("FleetFailedToLoadCargo");

    console.log("Fleet cargo loaded!");
  } catch (e) {
    throw e;
  }
};
