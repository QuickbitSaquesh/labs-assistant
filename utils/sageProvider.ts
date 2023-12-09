import { SageFleetHandler } from "../src/SageFleetHandler";
import { setupSageGameHandlerReadyAndLoadGame } from "./setupSageGameHandlerReadyAndLoadGame";
import { setupWallet } from "./setupWallet";

export const sageProvider = async () => {
  // Setup connection to solana and wallet keypair
  const { connection, walletKeypair } = await setupWallet();

  // Setup sage game handler and load sage labs
  const { sageGameHandler, playerPubkey } =
    await setupSageGameHandlerReadyAndLoadGame(walletKeypair, connection);

  // Setup fleet handler
  const sageFleetHandler = new SageFleetHandler(sageGameHandler);

  // Get the player profile public key
  const playerProfilePubkey = await sageGameHandler.getPlayerProfileAddress(
    playerPubkey
  );

  return {
    sageGameHandler,
    sageFleetHandler,
    playerProfilePubkey,
  };
};
