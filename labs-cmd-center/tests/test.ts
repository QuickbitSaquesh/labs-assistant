import { PublicKey } from "@solana/web3.js";
import { SageFleetHandler, SageGameHandler } from "..";
import { MAX_AMOUNT } from "../common/constants";
import { NotificationMessage } from "../common/notifications";
import { Resources } from "../common/resources";
import { sageProvider } from "../utils/sageProvider";
import { sendNotification } from "../utils/sendNotification";

const run = async () => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  const fleetName = "Flotta CARGO";
  const fleetPubkey = sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  /*   await loadCargo(fleetName, Resources.Carbon, 10000);
  await loadCargo(fleetName, Resources.CopperOre, 15000);
  await loadCargo(fleetName, Resources.IronOre, MAX_AMOUNT); */

  await sendNotification(
    NotificationMessage.CARGO_SUCCESS,
    fleetName,
    Resources.Carbon,
    158817
  );

  /* const tts = await sageFleetHandler.getTimeToSubwarp(
    fleetPubkey,
    [new BN(0), new BN(-39)],
    [new BN(2), new BN(-34)]
  );
  console.log(tts); */
  // await unloadFuel(fleetName, -9999);
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
    MAX_AMOUNT
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
