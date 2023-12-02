import { Resources } from "../common/resources";
import { sageProvider } from "../utils/sageProvider";

export const loadCargo = async (
  fleetName: string,
  resourceName: Resources,
  amount: number
) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  const fleetPubkey = await sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  console.log(" ");
  console.log("Loading cargo to fleet...");

  const mintToken = sageGameHandler.getResourceMintAddress(resourceName);

  try {
    let ix = await sageFleetHandler.ixDepositCargoToFleet(
      fleetPubkey,
      mintToken,
      amount
    );
    if (ix.type != "Success") throw new Error(ix.type);

    let tx = await sageGameHandler.buildAndSignTransaction(ix.ixs);

    let rx = await sageGameHandler.sendTransaction(tx);
    if (!rx.value.isOk()) throw Error("FleetFailedToLoadCargo");

    console.log("Fleet cargo loaded!");
  } catch (e) {
    throw e;
  }
};
