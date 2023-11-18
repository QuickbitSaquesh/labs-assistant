import { BN } from "@project-serum/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { SageFleetHandler } from "../src/sageFleetHandler";
import { SageGameHandler } from "../src/sageGameHandler";

const FLEETNAME = "Flotta DELTA";

const setupWallet = async () => {
  const rpc_url = Bun.env.SOLANA_RPC_URL ?? "http://localhost:8899";
  const connection = new Connection(rpc_url, "confirmed");
  const secretKey = Bun.env.SOLANA_WALLET_SECRET_KEY;

  if (!secretKey) {
    throw new Error("SOLANA_WALLET_SECRET_KEY environent variable is not set");
  }

  const walletKeypair = Keypair.fromSecretKey(bs58.decode(secretKey));

  if (!PublicKey.isOnCurve(walletKeypair.publicKey.toBytes())) {
    throw Error("wallet keypair is not on curve");
  }

  return { connection, walletKeypair };
};

const setupSageGameHandlerReadyAndLoadGame = async (
  walletKeypair: Keypair,
  connection: Connection
) => {
  const sageGameHandler = new SageGameHandler(walletKeypair, connection);
  await sageGameHandler.ready;
  await sageGameHandler.loadGame();

  const playerPubkey = new PublicKey(
    Bun.env.STAR_ATLAS_PLAYER_PROFILE ?? walletKeypair
  );

  return { sageGameHandler, playerPubkey };
};

let fleetAccount;
let ix;
let tx;
let rx;

const run = async () => {
  console.log(`<!-- Start Subwarp with ${FLEETNAME} -->`);

  // Setup wallet and SAGE game handler
  const { connection, walletKeypair } = await setupWallet();
  const { sageGameHandler, playerPubkey } =
    await setupSageGameHandlerReadyAndLoadGame(walletKeypair, connection);

  // Setup fleet handler
  const sageFleetHandler = new SageFleetHandler(sageGameHandler);

  // Get the player profile and fleet addresses (public keys)
  const playerProfilePubkey = await sageGameHandler.getPlayerProfileAddress(
    playerPubkey
  );
  const fleetPubkey = sageGameHandler.getFleetAddress(
    playerProfilePubkey,
    FLEETNAME
  );
  console.log(`Fleet address: ${fleetPubkey.toBase58()}`);

  // Get the fleet account
  fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);

  // Check that the fleet is idle, abort if not
  if (!fleetAccount.state.Idle) {
    throw Error("fleet is expected to be idle before warping");
  }

  // Warp the fleet
  const sectorFrom = fleetAccount.state.Idle?.sector as [BN, BN]; // [0, 0]
  const sectorTo: [BN, BN] = [
    sectorFrom[0].add(new BN(0)),
    sectorFrom[1].add(new BN(-1)),
  ]; // [1, 1]

  console.log(`Subwarp From - X: ${sectorFrom[0]} | Y: ${sectorFrom[1]}`);
  console.log(`Subwarp To - X: ${sectorTo[0]} | Y: ${sectorTo[1]}`);

  // Instruct the fleet to warp to coordinate
  ix = await sageFleetHandler.ixSubwarpToCoordinate(fleetPubkey, sectorTo);
  tx = await sageGameHandler.buildAndSignTransaction(ix);
  rx = await sageGameHandler.sendTransaction(tx);

  // Check that the transaction was a success, if not abort
  if (!rx.value.isOk()) {
    throw Error("fleet failed to subwarp");
  }

  // Get the fleet account
  fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);
  console.log(`Fleet state: ${JSON.stringify(fleetAccount.state)}`);

  console.log(`Waiting for 213 seconds...`);
  await new Promise((resolve) => setTimeout(resolve, 213000));

  // Instruct the fleet to exit warp
  ix = await sageFleetHandler.ixReadyToExitSubwarp(fleetPubkey);
  tx = await sageGameHandler.buildAndSignTransaction(ix);
  rx = await sageGameHandler.sendTransaction(tx);

  // Check that the transaction was a success, if not abort
  if (!rx.value.isOk()) {
    throw Error("fleet failed to exit subwarp");
  }

  // Get the fleet account
  fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);
  console.log(`Fleet state: ${JSON.stringify(fleetAccount.state)}`);

  console.log(`<!-- Stop Subwarp with ${FLEETNAME} -->`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
