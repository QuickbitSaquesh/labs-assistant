import { Resources } from "../common/resources";
import { sageProvider } from "../utils/sageProvider";

const run = async () => {
  const { sageGameHandler, sageFleetHandler, playerProfilePubkey } =
    await sageProvider();

  const fleetName = "Guanaco Fleet";
  const fleetPubkey = sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    fleetName
  );

  const tokenMint = sageGameHandler.getResourceMintAddress(Resources.Carbon);
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
