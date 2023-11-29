import { PublicKey } from "@solana/web3.js";
import { SageFleetHandler, SageGameHandler } from "..";
import { unloadFuel } from "../actions/unloadFuel";
import { Resources } from "../common/resources";
import { sageProvider } from "../utils/sageProvider";

const run = async () => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  const fleetName = "Flotta ALPHA";
  const fleetPubkey = sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  await unloadFuel(fleetName, -9999);
  // await test1(sageGameHandler, sageFleetHandler, fleetPubkey);
};

const test1 = async (
  sageGameHandler: SageGameHandler,
  sageFleetHandler: SageFleetHandler,
  fleetPubkey: PublicKey
) => {
  const tokenMint = sageGameHandler.getResourceMintAddress(Resources.Sdu);
  let ix = await sageFleetHandler.ixWithdrawCargoFromFleet(
    fleetPubkey,
    tokenMint,
    999_999
  );
  let tx = await sageGameHandler.buildAndSignTransaction(ix);
  let rx = await sageGameHandler.sendTransaction(tx);

  if (!rx.value.isOk()) {
    throw Error("Fleet failed to load cargo");
  }

  console.log("Fleet cargo loaded!");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
