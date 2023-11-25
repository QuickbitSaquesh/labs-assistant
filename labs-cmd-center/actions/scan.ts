import { sageProvider } from "../utils/sageProvider";

export const scan = async (fleetName: string) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  const fleetPubkey = sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  let ix = await sageFleetHandler.ixScanForSurveyDataUnits(fleetPubkey);
  let tx = await sageGameHandler.buildAndSignTransaction(ix);
  let rx = await sageGameHandler.sendTransaction(tx);

  if (!rx.value.isOk()) {
    throw new Error("Fleet failed to scan due to transaction failure");
  }

  console.log(`Scan completed for ${fleetName}!`);
};
