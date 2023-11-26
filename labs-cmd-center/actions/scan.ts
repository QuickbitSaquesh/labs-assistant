import { sageProvider } from "../utils/sageProvider";

export const scan = async (fleetName: string) => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  const fleetPubkey = sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  try {
    let ix = await sageFleetHandler.ixScanForSurveyDataUnits(fleetPubkey);
    let tx = await sageGameHandler.buildAndSignTransaction(ix.ixs);
    let rx = await sageGameHandler.sendTransaction(tx);
    if (!rx.value.isOk()) {
      switch (ix.type) {
        case "CreateSduTokenAccount":
          throw new Error("TokenAccountCreationFailed");
        case "ScanInstructionReady":
          throw new Error("FleetScanFailed");
        default:
          throw new Error("UnknownError");
      }
    } else {
      switch (ix.type) {
        case "CreateSduTokenAccount":
          console.log("");
          console.log(`SDU Token Account created!`);
        case "ScanInstructionReady":
          console.log("");
          console.log(`Scan completed for ${fleetName}!`);
      }
    }
  } catch (e) {
    throw e;
  }
};
