import { BN } from "@project-serum/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

import { SageFleetHandler } from "../src/sageFleetHandler";
import { SageGameHandler } from "../src/sageGameHandler";

const FLEET_NAME = "Flotta DELTA";

type LabsAction<R, A extends any[]> = (...args: A) => Promise<R>;

async function actionWrapper<R, A extends any[]>(
  func: LabsAction<R, A>,
  ...args: A
): Promise<R> {
  while (true) {
    try {
      return await func(...args);
    } catch (error) {
      console.error(`Attempt failed:`, error);
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }
  }
}

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

const sendSuccessNotification = async () => {
  const url = Bun.env.MAKE_HOOK as string;
  const payload = { message: "Ciclo di TRASPORTO completato con SUCCESSO" };
  const headers = { "Content-Type": "application/json" };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (response.status === 200) {
      console.log("Notification sent successfully.");
    } else {
      console.log(
        `Failed to send notification. Status code: ${response.status}`
      );
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

const sendErrorNotification = async () => {
  const url = Bun.env.MAKE_HOOK as string;
  const payload = { message: "Si è verificato un ERRORE durante il TRASPORTO" };
  const headers = { "Content-Type": "application/json" };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (response.status === 200) {
      console.log("Notification sent successfully.");
    } else {
      console.log(
        `Failed to send notification. Status code: ${response.status}`
      );
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

let ix;
let tx;
let rx;

const loadFuel = async (
  sageGameHandler: SageGameHandler,
  sageFleetHandler: SageFleetHandler,
  fleetPubkey: PublicKey,
  fuelAmount: BN
) => {
  // Get the fleet account
  let fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);
  if (fleetAccount.state.StarbaseLoadingBay) {
    console.log(" ");
    console.log("Loading fuel to fleet...");
    const mintToken = sageGameHandler.mints?.fuel as PublicKey;
    const fuelTankToKey = fleetAccount.data.fuelTank;

    ix = await sageFleetHandler.ixDepositCargoToFleet(
      fleetPubkey,
      fuelTankToKey,
      mintToken,
      fuelAmount
    );
    tx = await sageGameHandler.buildAndSignTransaction(ix);
    rx = await sageGameHandler.sendTransaction(tx);
    console.log("Fleet fuel loaded!");
  }
};

const loadCargo = async (
  sageGameHandler: SageGameHandler,
  sageFleetHandler: SageFleetHandler,
  fleetPubkey: PublicKey,
  amount: BN
) => {
  // Get the fleet account
  let fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);
  if (fleetAccount.state.StarbaseLoadingBay) {
    console.log(" ");
    console.log("Loading cargo to fleet...");
    const mintToken = sageGameHandler.getResourceMintAddress("carbon");
    const cargoPodToKey = fleetAccount.data.cargoHold;

    ix = await sageFleetHandler.ixDepositCargoToFleet(
      fleetPubkey,
      cargoPodToKey,
      mintToken,
      amount
    );
    tx = await sageGameHandler.buildAndSignTransaction(ix);
    rx = await sageGameHandler.sendTransaction(tx);
    console.log("Fleet cargo loaded!");
  }
};

const unloadCargo = async (
  sageGameHandler: SageGameHandler,
  sageFleetHandler: SageFleetHandler,
  fleetPubkey: PublicKey,
  amount: BN
) => {
  // Get the fleet account
  let fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);
  if (fleetAccount.state.StarbaseLoadingBay) {
    console.log(" ");
    console.log("Unloading cargo from fleet...");
    const mintToken = sageGameHandler.getResourceMintAddress("carbon");
    ix = await sageFleetHandler.ixWithdrawCargoFromFleet(
      fleetPubkey,
      mintToken,
      amount
    );
    tx = await sageGameHandler.buildAndSignTransaction(ix);
    rx = await sageGameHandler.sendTransaction(tx);
    console.log("Fleet cargo unloaded!");
  }
};

const dock = async (
  sageGameHandler: SageGameHandler,
  sageFleetHandler: SageFleetHandler,
  fleetPubkey: PublicKey
) => {
  // Instruct the fleet to dock to the starbase
  console.log(" ");
  console.log("Docking to starbase...");
  ix = await sageFleetHandler.ixDockToStarbase(fleetPubkey);
  tx = await sageGameHandler.buildAndSignTransaction(ix);
  rx = await sageGameHandler.sendTransaction(tx);
  console.log("Fleet docked!");
};

const undock = async (
  sageGameHandler: SageGameHandler,
  sageFleetHandler: SageFleetHandler,
  fleetPubkey: PublicKey
) => {
  // Instruct the fleet to dock to the starbase
  console.log(" ");
  console.log("Undocking from starbase...");
  ix = await sageFleetHandler.ixUndockFromStarbase(fleetPubkey);
  tx = await sageGameHandler.buildAndSignTransaction(ix);
  rx = await sageGameHandler.sendTransaction(tx);
  console.log("Fleet undocked!");
};

const warp = async (
  sageGameHandler: SageGameHandler,
  sageFleetHandler: SageFleetHandler,
  fleetPubkey: PublicKey,
  x: number,
  y: number,
  time: number,
  cooldown: number,
  waitCooldown: boolean
) => {
  // Get the fleet account
  let fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);
  console.log(" ");
  console.log(`Start warp...`);
  // Check that the fleet is idle, abort if not
  if (!fleetAccount.state.Idle) {
    throw Error("fleet is expected to be idle before warping");
  }

  // Warp the fleet
  const sectorFrom = fleetAccount.state.Idle?.sector as [BN, BN]; // [0, 0]
  const sectorTo: [BN, BN] = [
    sectorFrom[0].add(new BN(x)),
    sectorFrom[1].add(new BN(y)),
  ]; // [1, 1]

  console.log(`Warp From - X: ${sectorFrom[0]} | Y: ${sectorFrom[1]}`);
  console.log(`Warp To - X: ${sectorTo[0]} | Y: ${sectorTo[1]}`);

  // Instruct the fleet to warp to coordinate
  ix = await sageFleetHandler.ixWarpToCoordinate(fleetPubkey, sectorTo);
  tx = await sageGameHandler.buildAndSignTransaction(ix);
  rx = await sageGameHandler.sendTransaction(tx);

  // Check that the transaction was a success, if not abort
  if (!rx.value.isOk()) {
    throw Error("fleet failed to warp");
  }

  // Get the fleet account
  fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);
  console.log(`Fleet state: ${JSON.stringify(fleetAccount.state)}`);

  console.log(`Waiting for ${time} seconds...`);
  await new Promise((resolve) => setTimeout(resolve, time * 1000));

  // Instruct the fleet to exit warp
  ix = await sageFleetHandler.ixReadyToExitWarp(fleetPubkey);
  tx = await sageGameHandler.buildAndSignTransaction(ix);
  rx = await sageGameHandler.sendTransaction(tx);

  // Check that the transaction was a success, if not abort
  if (!rx.value.isOk()) {
    throw Error("fleet failed to exit warp");
  }

  // Get the fleet account
  fleetAccount = await sageFleetHandler.getFleetAccount(fleetPubkey);
  console.log(`Fleet state: ${JSON.stringify(fleetAccount.state)}`);

  console.log(`Stop warp...`);
  if (waitCooldown) {
    console.log(`Waiting for ${cooldown} seconds...`);
    await new Promise((resolve) => setTimeout(resolve, cooldown * 1000));
  }
};

const run = async () => {
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
    FLEET_NAME
  );
  console.log(`Fleet address: ${fleetPubkey.toBase58()}`);

  while (true) {
    try {
      await actionWrapper(
        loadFuel,
        sageGameHandler,
        sageFleetHandler,
        fleetPubkey,
        168039
      );
      await actionWrapper(
        undock,
        sageGameHandler,
        sageFleetHandler,
        fleetPubkey
      );
      await actionWrapper(
        warp,
        sageGameHandler,
        sageFleetHandler,
        fleetPubkey,
        0,
        10,
        100,
        300,
        true
      );
      await actionWrapper(
        warp,
        sageGameHandler,
        sageFleetHandler,
        fleetPubkey,
        2,
        6,
        63,
        300,
        true
      );
      await actionWrapper(dock, sageGameHandler, sageFleetHandler, fleetPubkey);
      await actionWrapper(
        loadCargo,
        sageGameHandler,
        sageFleetHandler,
        fleetPubkey,
        208350
      );
      await actionWrapper(
        undock,
        sageGameHandler,
        sageFleetHandler,
        fleetPubkey
      );
      await actionWrapper(
        warp,
        sageGameHandler,
        sageFleetHandler,
        fleetPubkey,
        0,
        -10,
        100,
        300,
        true
      );
      await actionWrapper(
        warp,
        sageGameHandler,
        sageFleetHandler,
        fleetPubkey,
        -2,
        -6,
        63,
        300,
        true
      );
      await actionWrapper(dock, sageGameHandler, sageFleetHandler, fleetPubkey);
      await actionWrapper(
        unloadCargo,
        sageGameHandler,
        sageFleetHandler,
        fleetPubkey,
        208350
      );

      sendSuccessNotification();
    } catch (e) {
      sendErrorNotification();
    }
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
