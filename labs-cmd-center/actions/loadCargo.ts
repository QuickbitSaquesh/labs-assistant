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
    if (!ix) return;
    let tx = await sageGameHandler.buildAndSignTransaction(ix);
    let rx = await sageGameHandler.sendTransaction(tx);

    // Check that the transaction was a success, if not abort
    if (!rx.value.isOk()) {
      throw Error("Fleet failed to load cargo");
    }

    console.log("Fleet cargo loaded!");
  } catch (e) {
    throw e;
  }
};
