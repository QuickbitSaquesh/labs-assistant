import { sageProvider } from "../utils/sageProvider";

export const scan = async (fleetName: string) => {
  /* try { */
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  const fleetPubkey = sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  let fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);
  /* try {
      fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);
    } catch (e) {
      throw new Error(`Error retrieving fleet account`);
    } */

  /*     try { */
  let ix = await sageFleetHandler.ixScanForSurveyDataUnits(fleetPubkey);
  let tx = await sageGameHandler.buildAndSignTransaction(ix);
  let rx = await sageGameHandler.sendTransaction(tx);

  if (!rx.value.isOk()) {
    throw new Error("Fleet failed to scan due to transaction failure");
  }

  console.log(`Scan completed for ${fleetName}!`);
  /*     } catch (e) {
      throw new Error(`Error during fleet scan operation: ${e}`);
    } */
  /*   } catch (e) {
    console.error(`Scan operation failed for ${fleetName}: ${e}`);
    throw new Error(`Scan failed: ${e}`);
  } */
};
