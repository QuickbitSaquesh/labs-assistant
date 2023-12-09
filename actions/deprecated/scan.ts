import { PublicKey } from "@solana/web3.js";
import { sageProvider } from "../utils/sageProvider";
import { buildAndSignTransactionAndCheck } from "../utils/transactions/buildAndSignTransactionAndCheck";
import { sendTransactionAndCheck } from "../utils/transactions/sendTransactionAndCheck";

// TODO: Need refactoring - current version is deprecated
export const scan = async (fleetPubkey: PublicKey) => {
  const { sageFleetHandler } = await sageProvider();

  try {
    let ix = await sageFleetHandler.ixScanForSurveyDataUnits(fleetPubkey);
    let tx = await buildAndSignTransactionAndCheck(ix.ixs, true);
    let rx = await sendTransactionAndCheck(tx);
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
