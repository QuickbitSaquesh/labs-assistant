import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { Fleet, Starbase } from "@staratlas/sage";

export type LabsAction<R, A extends any[]> = (...args: A) => Promise<R>;

export type FleetScan = {
  name: string;
  x: number;
  y: number;
  time: number;
  scanCooldown: number;
};

export type FleetData = {
  fleetName: string;
  fleetPubkey: PublicKey;
  fleetAccount: Fleet;
  currentSector: [BN, BN];
};

export type StarbaseData = {
  starbasePubkey: PublicKey;
  starbaseAccount: Starbase;
};
