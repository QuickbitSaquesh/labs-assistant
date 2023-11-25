import { BN } from "@project-serum/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import {
  InstructionReturn,
  createAssociatedTokenAccountIdempotent,
  readFromRPCOrError,
} from "@staratlas/data-source";
import {
  CargoStats,
  DepositCargoToFleetInput,
  Fleet,
  LoadingBayToIdleInput,
  MineItem,
  MiscStats,
  Planet,
  Resource,
  ScanForSurveyDataUnitsInput,
  Sector,
  Starbase,
  StartMiningAsteroidInput,
  StartSubwarpInput,
  StopMiningAsteroidInput,
  SurveyDataUnitTracker,
  WarpToCoordinateInput,
} from "@staratlas/sage";

import { NoEnoughRepairKits } from "../common/errors";
import { SageGameHandler } from "./sageGameHandler";

export class SageFleetHandler {
  constructor(private _gameHandler: SageGameHandler) {}

  async getFleetAccount(fleetPubkey: PublicKey): Promise<Fleet> {
    const fleet = readFromRPCOrError(
      this._gameHandler.provider.connection,
      this._gameHandler.program,
      fleetPubkey,
      Fleet,
      "confirmed"
    );

    return fleet;
  }

  async getMineItemAccount(mineItemPubkey: PublicKey): Promise<MineItem> {
    const mineItem = readFromRPCOrError(
      this._gameHandler.provider.connection,
      this._gameHandler.program,
      mineItemPubkey,
      MineItem,
      "confirmed"
    );

    return mineItem;
  }

  async getPlanetAccount(planetPubkey: PublicKey): Promise<Planet> {
    const planet = readFromRPCOrError(
      this._gameHandler.provider.connection,
      this._gameHandler.program,
      planetPubkey,
      Planet,
      "confirmed"
    );

    return planet;
  }

  async getResourceAccount(resourcePubkey: PublicKey): Promise<Resource> {
    const resource = readFromRPCOrError(
      this._gameHandler.provider.connection,
      this._gameHandler.program,
      resourcePubkey,
      Resource,
      "confirmed"
    );

    return resource;
  }

  async getSectorAccount(sectorPubkey: PublicKey): Promise<Sector> {
    const sector = readFromRPCOrError(
      this._gameHandler.provider.connection,
      this._gameHandler.program,
      sectorPubkey,
      Sector,
      "confirmed"
    );

    return sector;
  }

  async getStarbaseAccount(starbasePubkey: PublicKey): Promise<Starbase> {
    const starbase = readFromRPCOrError(
      this._gameHandler.provider.connection,
      this._gameHandler.program,
      starbasePubkey,
      Starbase,
      "confirmed"
    );

    return starbase;
  }

  async ixScanForSurveyDataUnits(
    fleetPubkey: PublicKey
  ): Promise<InstructionReturn[]> {
    const ixs: InstructionReturn[] = [];

    const fleetAccount = await this.getFleetAccount(fleetPubkey);
    const fleetCargoHold = fleetAccount.data.cargoHold;
    const miscStats = fleetAccount.data.stats.miscStats as MiscStats;

    if (!fleetAccount.state.Idle) {
      throw Error("Fleet is not idle");
    }

    const playerProfile = fleetAccount.data.ownerProfile;

    const program = this._gameHandler.program;
    const cargoProgram = this._gameHandler.cargoProgram;

    const payer = this._gameHandler.funder;
    const profileFaction =
      this._gameHandler.getProfileFactionAddress(playerProfile);

    const gameId = this._gameHandler.gameId as PublicKey;
    const gameState = this._gameHandler.gameState as PublicKey;
    const input = { keyIndex: 0 } as ScanForSurveyDataUnitsInput;
    const surveyDataUnitTracker = new PublicKey(
      "EJ74A2vb3HFhaEh4HqdejPpQoBjnyEctotcx1WudChwj"
    );

    const repairKitMint = this._gameHandler.game?.data.mints
      .repairKit as PublicKey;
    const repairKitCargoType =
      this._gameHandler.getCargoTypeAddress(repairKitMint);

    const sduMint = this._gameHandler.getResourceMintAddress("sdu");
    const sduCargoType = this._gameHandler.getCargoTypeAddress(sduMint);

    const cargoStatsDefinition = this._gameHandler
      .cargoStatsDefinition as PublicKey;

    const [signerAddress] = await SurveyDataUnitTracker.findSignerAddress(
      this._gameHandler.program,
      surveyDataUnitTracker
    );

    const sduTokenFrom = await getAssociatedTokenAddress(
      sduMint,
      signerAddress,
      true
    );
    const sduTokenTo = await getAssociatedTokenAddress(
      sduMint,
      fleetCargoHold,
      true
    );

    const repairKitTokenFrom = await getAssociatedTokenAddress(
      repairKitMint,
      fleetCargoHold,
      true
    );

    const cargoPodFromKey = fleetAccount.data.cargoHold;

    const tokenAccount = (
      await this._gameHandler.getParsedTokenAccountsByOwner(cargoPodFromKey)
    ).find(
      (tokenAccount) =>
        tokenAccount.mint.toBase58() === repairKitMint.toBase58()
    );

    if (!tokenAccount) {
      throw Error("Token account not found");
    }

    if (tokenAccount.amount < miscStats.scanRepairKitAmount) {
      throw new NoEnoughRepairKits("Not enough toolkits to scan");
    }

    const ix_1 = SurveyDataUnitTracker.scanForSurveyDataUnits(
      program,
      cargoProgram,
      payer,
      playerProfile,
      profileFaction,
      fleetPubkey,
      surveyDataUnitTracker,
      fleetCargoHold,
      sduCargoType,
      repairKitCargoType,
      cargoStatsDefinition,
      sduTokenFrom,
      sduTokenTo,
      repairKitTokenFrom,
      repairKitMint,
      gameId,
      gameState,
      input
    );

    ixs.push(ix_1);

    return ixs;
  }

  async ixDockToStarbase(fleetPubkey: PublicKey): Promise<InstructionReturn[]> {
    const fleetAccount = await this.getFleetAccount(fleetPubkey);

    // TODO: ensure fleet state is "Idle" - is there a better way to do this?
    if (!fleetAccount.state.Idle && !this._gameHandler.game) {
      throw Error("fleet is not idle (or game is not loaded)");
    }

    const ixs: InstructionReturn[] = [];

    const coordinates = fleetAccount.state.Idle?.sector as [BN, BN];

    const starbaseKey = await this._gameHandler.getStarbaseAddress(coordinates);
    const starbaseAccount = await this.getStarbaseAccount(starbaseKey);

    const playerProfile = fleetAccount.data.ownerProfile;
    const sagePlayerProfile =
      await this._gameHandler.getSagePlayerProfileAddress(playerProfile);
    const starbasePlayerKey = await this._gameHandler.getStarbasePlayerAddress(
      starbaseKey,
      sagePlayerProfile,
      starbaseAccount.data.seqId
    );

    const program = this._gameHandler.program;
    const key = this._gameHandler.funder;
    const profileFaction =
      this._gameHandler.getProfileFactionAddress(playerProfile);
    const fleetKey = fleetAccount.key;
    const gameId = this._gameHandler.gameId as PublicKey;
    const gameState = this._gameHandler.gameState as PublicKey;
    const input = 0 as LoadingBayToIdleInput; // TODO: when would this change?

    const ix_1 = Fleet.idleToLoadingBay(
      program,
      key,
      playerProfile,
      profileFaction,
      fleetKey,
      starbaseKey,
      starbasePlayerKey,
      gameId,
      gameState,
      input
    );

    ixs.push(ix_1);

    return ixs;
  }

  async ixUndockFromStarbase(
    fleetPubkey: PublicKey
  ): Promise<InstructionReturn[]> {
    const fleetAccount = await this.getFleetAccount(fleetPubkey);

    // TODO: ensure fleet state is "StarbaseLoadingBay" - is there a better way to do this?
    if (!fleetAccount.state.StarbaseLoadingBay && !this._gameHandler.game) {
      throw "fleet is not at starbase loading bay (or game is not loaded)";
    }

    const ixs: InstructionReturn[] = [];

    const starbaseKey = fleetAccount.state.StarbaseLoadingBay
      ?.starbase as PublicKey;
    const starbaseAccount = await this.getStarbaseAccount(starbaseKey);

    const playerProfile = fleetAccount.data.ownerProfile;
    const sagePlayerProfile =
      await this._gameHandler.getSagePlayerProfileAddress(playerProfile);
    const starbasePlayerKey = await this._gameHandler.getStarbasePlayerAddress(
      starbaseKey,
      sagePlayerProfile,
      starbaseAccount.data.seqId
    );

    const program = this._gameHandler.program;
    const key = this._gameHandler.funder;
    const profileFaction =
      this._gameHandler.getProfileFactionAddress(playerProfile);
    const fleetKey = fleetAccount.key;
    const gameId = this._gameHandler.gameId as PublicKey;
    const gameState = this._gameHandler.gameState as PublicKey;
    const input = 0 as LoadingBayToIdleInput; // TODO: when would this change?

    const ix_1 = Fleet.loadingBayToIdle(
      program,
      key,
      playerProfile,
      profileFaction,
      fleetKey,
      starbaseKey,
      starbasePlayerKey,
      gameId,
      gameState,
      input
    );

    ixs.push(ix_1);

    return ixs;
  }

  async ixStartMining(
    fleetPubkey: PublicKey,
    resource: string
  ): Promise<InstructionReturn[]> {
    const fleetAccount = await this.getFleetAccount(fleetPubkey);

    // TODO: ensure fleet state is "Idle" - is there a better way to do this?
    if (!fleetAccount.state.Idle && !this._gameHandler.game) {
      throw "fleet is not idle (or game is not loaded)";
    }

    const ixs: InstructionReturn[] = [];

    // TODO: is there a better way determine if anything is mineable (mint) at this 'location'?
    // see `getPlanetAddress` in sageGameHandler.ts (cache of planet addresses on load)
    const coordinates = fleetAccount.state.Idle?.sector as [BN, BN];

    const starbaseKey = await this._gameHandler.getStarbaseAddress(coordinates);
    const starbaseAccount = await this.getStarbaseAccount(starbaseKey);

    const playerProfile = fleetAccount.data.ownerProfile;
    const sagePlayerProfile =
      await this._gameHandler.getSagePlayerProfileAddress(playerProfile);
    const starbasePlayerKey = await this._gameHandler.getStarbasePlayerAddress(
      starbaseKey,
      sagePlayerProfile,
      starbaseAccount.data.seqId
    );
    const planetKey = await this._gameHandler.getPlanetAddress(
      starbaseAccount.data.sector as [BN, BN]
    );

    const mint = this._gameHandler.getResourceMintAddress(resource);

    if (!mint) {
      throw `resource mint not found for ${resource}`;
    }

    const mineItemKey = await this._gameHandler.getMineItemAddress(mint);
    const resourceKey = this._gameHandler.getResrouceAddress(
      mineItemKey,
      planetKey
    );

    const profileFaction =
      this._gameHandler.getProfileFactionAddress(playerProfile);
    const fleetKey = fleetAccount.key;

    const program = this._gameHandler.program;
    const key = this._gameHandler.funder;
    const gameState = this._gameHandler.gameState as PublicKey;
    const gameId = this._gameHandler.gameId as PublicKey;
    const input = { keyIndex: 0 } as StartMiningAsteroidInput;

    const ix_1 = Fleet.startMiningAsteroid(
      program,
      key,
      playerProfile,
      profileFaction,
      fleetKey,
      starbaseKey,
      starbasePlayerKey,
      mineItemKey,
      resourceKey,
      planetKey,
      gameState,
      gameId,
      input
    );

    ixs.push(ix_1);

    return ixs;
  }

  async ixStopMining(fleetPubkey: PublicKey): Promise<InstructionReturn[]> {
    const fleetAccount = await this.getFleetAccount(fleetPubkey);

    // TODO: ensure fleet state is "MineAsteroid" - is there a better way to do this?
    if (!fleetAccount.state.MineAsteroid && !this._gameHandler.game) {
      throw "fleet is not mining an asteroid (or game is not loaded)";
    }

    const ixs: InstructionReturn[] = [];

    const gameFoodMint = this._gameHandler.game?.data.mints.food as PublicKey;
    const gameAmmoMint = this._gameHandler.game?.data.mints.ammo as PublicKey;
    const gameFuelMint = this._gameHandler.game?.data.mints.fuel as PublicKey;

    const resourceKey = fleetAccount.state.MineAsteroid?.resource as PublicKey;
    const resourceAccount = await this.getResourceAccount(resourceKey);

    const mineItemKey = resourceAccount.data.mineItem; // TODO: check if this is the only way to get the 'mineItemKey'
    const mineItemAccount = await this.getMineItemAccount(mineItemKey);
    const mint = mineItemAccount.data.mint; // TODO: check if this is the only way get the 'mint'

    const planetKey = fleetAccount.state.MineAsteroid?.asteroid as PublicKey;
    const planetAccount = await this.getPlanetAccount(planetKey);

    const coordinates = planetAccount.data.sector as [BN, BN]; // TODO: check if this is the only way get the 'coordinates'
    const starbaseKey = await this._gameHandler.getStarbaseAddress(coordinates);

    const cargoHold = fleetAccount.data.cargoHold;
    const fleetAmmoBank = fleetAccount.data.ammoBank;
    const fleetFuelTank = fleetAccount.data.fuelTank;

    const resourceTokenFrom = await getAssociatedTokenAddress(
      mint,
      mineItemKey,
      true
    );
    const ataResourceTokenTo = await createAssociatedTokenAccountIdempotent(
      mint,
      cargoHold,
      true
    );
    const resourceTokenTo = ataResourceTokenTo.address;
    const ix_0 = ataResourceTokenTo.instructions;

    ixs.push(ix_0);

    const fleetFoodToken = await getAssociatedTokenAddress(
      gameFoodMint,
      cargoHold,
      true
    );
    const fleetAmmoToken = await getAssociatedTokenAddress(
      gameAmmoMint,
      fleetAmmoBank,
      true
    );
    const fleetFuelToken = await getAssociatedTokenAddress(
      gameFuelMint,
      fleetFuelTank,
      true
    );

    const program = this._gameHandler.program;
    const cargoProgram = this._gameHandler.cargoProgram;
    const playerProfile = fleetAccount.data.ownerProfile;
    const profileFaction =
      this._gameHandler.getProfileFactionAddress(playerProfile);
    const fleetKey = fleetAccount.key;
    const ammoBank = fleetAccount.data.ammoBank;
    const foodCargoType = this._gameHandler.getCargoTypeAddress(gameFoodMint);
    const ammoCargoType = this._gameHandler.getCargoTypeAddress(gameAmmoMint);
    const resourceCargoType = this._gameHandler.getCargoTypeAddress(mint);
    const cargoStatsDefinition = this._gameHandler
      .cargoStatsDefinition as PublicKey;
    const gameState = this._gameHandler.gameState as PublicKey;
    const gameId = this._gameHandler.gameId as PublicKey;
    const foodTokenFrom = fleetFoodToken;
    const ammoTokenFrom = fleetAmmoToken;
    const foodMint = gameFoodMint;
    const ammoMint = gameAmmoMint;

    const ix_1 = Fleet.asteroidMiningHandler(
      program,
      cargoProgram,
      profileFaction,
      fleetKey,
      starbaseKey,
      mineItemKey,
      resourceKey,
      planetKey,
      cargoHold,
      ammoBank,
      foodCargoType,
      ammoCargoType,
      resourceCargoType,
      cargoStatsDefinition,
      gameState,
      gameId,
      foodTokenFrom,
      ammoTokenFrom,
      resourceTokenFrom,
      resourceTokenTo,
      foodMint,
      ammoMint
    );

    ixs.push(ix_1);

    const key = this._gameHandler.funder;
    const fuelTank = fleetFuelTank;
    const fuelCargoType = this._gameHandler.getCargoTypeAddress(gameFuelMint);
    const fuelTokenFrom = fleetFuelToken;
    const fuelMint = gameFuelMint;
    const input = { keyIndex: 0 } as StopMiningAsteroidInput;

    const ix_2 = Fleet.stopMiningAsteroid(
      program,
      cargoProgram,
      key,
      playerProfile,
      profileFaction,
      fleetKey,
      resourceKey,
      planetKey,
      fuelTank,
      fuelCargoType,
      cargoStatsDefinition,
      gameState,
      gameId,
      fuelTokenFrom,
      fuelMint,
      input
    );

    ixs.push(ix_2);

    return ixs;
  }

  // New
  // TODO: improve error handling
  async ixDepositCargoToFleet(
    fleetPubkey: PublicKey,
    tokenMint: PublicKey,
    amount: number
  ): Promise<InstructionReturn[]> {
    const ixs: InstructionReturn[] = [];

    if (amount < 0) throw new Error("Amount can't be negative");

    // Fleet data
    const fleetAccount = await this.getFleetAccount(fleetPubkey);
    const fleetCargoStats = fleetAccount.data.stats.cargoStats as CargoStats;

    if (!fleetAccount.state.StarbaseLoadingBay)
      throw new Error("Fleet is not at starbase loading bay");

    // Player Profile
    const playerProfilePubkey = fleetAccount.data.ownerProfile;
    const sagePlayerProfilePubkey =
      await this._gameHandler.getSagePlayerProfileAddress(playerProfilePubkey);
    const profileFactionPubkey =
      this._gameHandler.getProfileFactionAddress(playerProfilePubkey);

    if (!sagePlayerProfilePubkey)
      throw new Error("Sage Player Profile not found");

    // Starbase where the fleet is located
    const starbasePubkey = fleetAccount.state.StarbaseLoadingBay
      .starbase as PublicKey;
    const starbaseAccount = await this.getStarbaseAccount(starbasePubkey);

    // PDA Starbase - Player
    const starbasePlayerPubkey = this._gameHandler.getStarbasePlayerAddress(
      starbasePubkey,
      sagePlayerProfilePubkey,
      starbaseAccount.data.seqId
    );
    const starbasePlayerAccount = await this._gameHandler.getStarbasePlayer(
      starbasePlayerPubkey
    );

    // This PDA account is the owner of all player resource token accounts
    // in the starbase where the fleet is located (Starbase Cargo Pods - Deposito merci nella Starbase)
    const starbasePlayerCargoPodsAccount =
      await this._gameHandler.getCargoPodsByAuthority(starbasePlayerPubkey);
    const starbasePlayerCargoPodsPubkey = starbasePlayerCargoPodsAccount.key;
    const tokenAccountFrom = (
      await this._gameHandler.getParsedTokenAccountsByOwner(
        starbasePlayerCargoPodsPubkey
      )
    ).find(
      (tokenAccount) => tokenAccount.mint.toBase58() === tokenMint.toBase58()
    );

    if (!tokenAccountFrom)
      throw new Error("Starbase player cargo pod token account not found");

    const tokenAccountFromPubkey = tokenAccountFrom.address;

    // This PDA account is the owner of all the resources in the fleet's cargo (Fleet Cargo Holds - Stiva della flotta)
    const fleetCargoHoldsPubkey = fleetAccount.data.cargoHold;
    const tokenAccountTo = (
      await this._gameHandler.getParsedTokenAccountsByOwner(
        fleetCargoHoldsPubkey
      )
    ).find(
      (tokenAccount) => tokenAccount.mint.toBase58() === tokenMint.toBase58()
    );
    const tokenAccountToATA = createAssociatedTokenAccountIdempotent(
      tokenMint,
      fleetCargoHoldsPubkey,
      true
    );
    const tokenAccountToPubkey = tokenAccountToATA.address;

    const ix_0 = tokenAccountToATA.instructions;
    ixs.push(ix_0);

    // amount > fleet free capacity?
    let amountBN = BN.min(
      new BN(amount),
      tokenAccountTo
        ? new BN(fleetCargoStats.cargoCapacity).sub(
            new BN(tokenAccountTo.amount)
          )
        : new BN(fleetCargoStats.cargoCapacity)
    );
    // amount > starbase amount?
    amountBN = BN.min(amountBN, new BN(tokenAccountFrom.amount));

    /* if (amountBN <= 0)
      throw new Error(
        "Fleet cargo is full or the resource is no longer available in starbase"
      ); */

    const program = this._gameHandler.program;
    const cargoProgram = this._gameHandler.cargoProgram;
    const payer = this._gameHandler.funder;
    const payerPubkey = payer.publicKey();
    const gameId = this._gameHandler.gameId as PublicKey;
    const gameState = this._gameHandler.gameState as PublicKey;
    const input = { keyIndex: 0, amount: amountBN } as DepositCargoToFleetInput;
    const cargoType = this._gameHandler.getCargoTypeAddress(tokenMint);
    const cargoStatsDefinition = this._gameHandler
      .cargoStatsDefinition as PublicKey;

    const ix_1 = Fleet.depositCargoToFleet(
      program,
      cargoProgram,
      payer,
      playerProfilePubkey,
      profileFactionPubkey,
      payerPubkey,
      starbasePubkey,
      starbasePlayerPubkey,
      fleetPubkey,
      starbasePlayerCargoPodsPubkey,
      fleetCargoHoldsPubkey,
      cargoType,
      cargoStatsDefinition,
      tokenAccountFromPubkey,
      tokenAccountToPubkey,
      tokenMint,
      gameId,
      gameState,
      input
    );

    ixs.push(ix_1);

    return ixs;
  }

  // New
  // TODO: improve error handling
  async ixWithdrawCargoFromFleet(
    fleetPubkey: PublicKey,
    tokenMint: PublicKey,
    amount: number
  ): Promise<InstructionReturn[]> {
    const ixs: InstructionReturn[] = [];

    if (amount < 0) throw new Error("Amount can't be negative");

    // Fleet data
    const fleetAccount = await this.getFleetAccount(fleetPubkey);
    const fleetCargoStats = fleetAccount.data.stats.cargoStats as CargoStats;

    if (!fleetAccount.state.StarbaseLoadingBay)
      throw new Error("Fleet is not at starbase loading bay");

    // Player Profile
    const playerProfilePubkey = fleetAccount.data.ownerProfile;
    const sagePlayerProfilePubkey =
      await this._gameHandler.getSagePlayerProfileAddress(playerProfilePubkey);
    const profileFactionPubkey =
      this._gameHandler.getProfileFactionAddress(playerProfilePubkey);

    if (!sagePlayerProfilePubkey)
      throw new Error("Sage Player Profile not found");

    // This PDA account is the owner of all the resources in the fleet's cargo (Fleet Cargo Holds - Stiva della flotta)
    const fleetCargoHoldsPubkey = fleetAccount.data.cargoHold;
    const tokenAccountFrom = (
      await this._gameHandler.getParsedTokenAccountsByOwner(
        fleetCargoHoldsPubkey
      )
    ).find(
      (tokenAccount) => tokenAccount.mint.toBase58() === tokenMint.toBase58()
    );

    if (!tokenAccountFrom)
      throw new Error("Fleet cargo hold token account not found");

    const tokenAccountFromPubkey = tokenAccountFrom.address;

    // Starbase where the fleet is located
    const starbasePubkey = fleetAccount.state.StarbaseLoadingBay
      .starbase as PublicKey;
    const starbaseAccount = await this.getStarbaseAccount(starbasePubkey);

    // PDA Starbase - Player
    const starbasePlayerPubkey = this._gameHandler.getStarbasePlayerAddress(
      starbasePubkey,
      sagePlayerProfilePubkey,
      starbaseAccount.data.seqId
    );
    const starbasePlayerAccount = await this._gameHandler.getStarbasePlayer(
      starbasePlayerPubkey
    );

    // This PDA account is the owner of all player resource token accounts
    // in the starbase where the fleet is located (Starbase Cargo Pods - Deposito merci nella Starbase)
    const starbasePlayerCargoPodsAccount =
      await this._gameHandler.getCargoPodsByAuthority(starbasePlayerPubkey);
    const starbasePlayerCargoPodsPubkey = starbasePlayerCargoPodsAccount.key;
    const tokenAccountTo = (
      await this._gameHandler.getParsedTokenAccountsByOwner(
        starbasePlayerCargoPodsPubkey
      )
    ).find(
      (tokenAccount) => tokenAccount.mint.toBase58() === tokenMint.toBase58()
    );

    const tokenAccountToATA = createAssociatedTokenAccountIdempotent(
      tokenMint,
      starbasePlayerCargoPodsPubkey,
      true
    );
    const tokenAccountToPubkey = tokenAccountToATA.address;

    const ix_0 = tokenAccountToATA.instructions;
    ixs.push(ix_0);

    let amountBN = BN.min(new BN(amount), new BN(tokenAccountFrom.amount));
    if (amountBN <= 0) throw new Error("Amount can't be negative");

    const program = this._gameHandler.program;
    const cargoProgram = this._gameHandler.cargoProgram;
    const payer = this._gameHandler.funder;
    const payerPubkey = payer.publicKey();
    const gameId = this._gameHandler.gameId as PublicKey;
    const gameState = this._gameHandler.gameState as PublicKey;
    const input = { keyIndex: 0, amount: amountBN } as DepositCargoToFleetInput;
    const cargoType = this._gameHandler.getCargoTypeAddress(tokenMint);
    const cargoStatsDefinition = this._gameHandler
      .cargoStatsDefinition as PublicKey;

    const ix_1 = Fleet.withdrawCargoFromFleet(
      program,
      cargoProgram,
      payer,
      payerPubkey,
      playerProfilePubkey,
      profileFactionPubkey,
      starbasePubkey,
      starbasePlayerPubkey,
      fleetPubkey,
      fleetCargoHoldsPubkey,
      starbasePlayerCargoPodsPubkey,
      cargoType,
      cargoStatsDefinition,
      tokenAccountFromPubkey,
      tokenAccountToPubkey,
      tokenMint,
      gameId,
      gameState,
      input
    );

    ixs.push(ix_1);

    return ixs;
  }

  // New
  // TODO: improve error handling
  async ixRefuelFleet(
    fleetPubkey: PublicKey,
    amount: number
  ): Promise<InstructionReturn[]> {
    const ixs: InstructionReturn[] = [];

    if (amount < 0) throw new Error("Amount can't be negative");

    const fuelMint = this._gameHandler.getResourceMintAddress("fuel");

    // Fleet data
    const fleetAccount = await this.getFleetAccount(fleetPubkey);
    const fleetCargoStats = fleetAccount.data.stats.cargoStats as CargoStats;

    if (!fleetAccount.state.StarbaseLoadingBay)
      throw new Error("Fleet is not at starbase loading bay");

    // Player Profile
    const playerProfilePubkey = fleetAccount.data.ownerProfile;
    const sagePlayerProfilePubkey =
      await this._gameHandler.getSagePlayerProfileAddress(playerProfilePubkey);
    const profileFactionPubkey =
      this._gameHandler.getProfileFactionAddress(playerProfilePubkey);

    if (!sagePlayerProfilePubkey)
      throw new Error("Sage Player Profile not found");

    // Starbase where the fleet is located
    const starbasePubkey = fleetAccount.state.StarbaseLoadingBay
      .starbase as PublicKey;
    const starbaseAccount = await this.getStarbaseAccount(starbasePubkey);

    // PDA Starbase - Player
    const starbasePlayerPubkey = this._gameHandler.getStarbasePlayerAddress(
      starbasePubkey,
      sagePlayerProfilePubkey,
      starbaseAccount.data.seqId
    );
    const starbasePlayerAccount = await this._gameHandler.getStarbasePlayer(
      starbasePlayerPubkey
    );

    // This PDA account is the owner of all player resource token accounts
    // in the starbase where the fleet is located (Starbase Cargo Pods - Deposito merci nella Starbase)
    const starbasePlayerCargoPodsAccount =
      await this._gameHandler.getCargoPodsByAuthority(starbasePlayerPubkey);
    const starbasePlayerCargoPodsPubkey = starbasePlayerCargoPodsAccount.key;
    const tokenAccountFrom = (
      await this._gameHandler.getParsedTokenAccountsByOwner(
        starbasePlayerCargoPodsPubkey
      )
    ).find(
      (tokenAccount) => tokenAccount.mint.toBase58() === fuelMint.toBase58()
    );

    if (!tokenAccountFrom)
      throw new Error("Starbase player fuel token account not found");

    const tokenAccountFromPubkey = tokenAccountFrom.address;

    // This PDA account is the owner of all the resources in the fleet's cargo (Fleet Cargo Holds - Stiva della flotta)
    const fleetFuelTankPubkey = fleetAccount.data.fuelTank;
    const tokenAccountTo = (
      await this._gameHandler.getParsedTokenAccountsByOwner(fleetFuelTankPubkey)
    ).find(
      (tokenAccount) => tokenAccount.mint.toBase58() === fuelMint.toBase58()
    );
    const tokenAccountToATA = createAssociatedTokenAccountIdempotent(
      fuelMint,
      fleetFuelTankPubkey,
      true
    );
    const tokenAccountToPubkey = tokenAccountToATA.address;

    const ix_0 = tokenAccountToATA.instructions;
    ixs.push(ix_0);

    // amount > fleet free capacity?
    let amountBN = BN.min(
      new BN(amount),
      tokenAccountTo
        ? new BN(fleetCargoStats.fuelCapacity).sub(
            new BN(tokenAccountTo.amount)
          )
        : new BN(fleetCargoStats.fuelCapacity)
    );
    // amount > starbase amount?
    amountBN = BN.min(amountBN, new BN(tokenAccountFrom.amount));

    /* if (amountBN <= 0)
      throw new Error(
        "Fleet fuel tank is full or the resource is no longer available in starbase"
      ); */

    const program = this._gameHandler.program;
    const cargoProgram = this._gameHandler.cargoProgram;
    const payer = this._gameHandler.funder;
    const payerPubkey = payer.publicKey();
    const gameId = this._gameHandler.gameId as PublicKey;
    const gameState = this._gameHandler.gameState as PublicKey;
    const input = { keyIndex: 0, amount: amountBN } as DepositCargoToFleetInput;
    const cargoType = this._gameHandler.getCargoTypeAddress(fuelMint);
    const cargoStatsDefinition = this._gameHandler
      .cargoStatsDefinition as PublicKey;

    const ix_1 = Fleet.depositCargoToFleet(
      program,
      cargoProgram,
      payer,
      playerProfilePubkey,
      profileFactionPubkey,
      payerPubkey,
      starbasePubkey,
      starbasePlayerPubkey,
      fleetPubkey,
      starbasePlayerCargoPodsPubkey,
      fleetFuelTankPubkey,
      cargoType,
      cargoStatsDefinition,
      tokenAccountFromPubkey,
      tokenAccountToPubkey,
      fuelMint,
      gameId,
      gameState,
      input
    );

    ixs.push(ix_1);

    return ixs;
  }

  // New
  // TODO: improve error handling
  async ixRearmFleet(
    fleetPubkey: PublicKey,
    amount: number
  ): Promise<InstructionReturn[]> {
    const ixs: InstructionReturn[] = [];

    if (amount < 0) throw new Error("Amount can't be negative");

    const ammoMint = this._gameHandler.getResourceMintAddress("ammo");

    // Fleet data
    const fleetAccount = await this.getFleetAccount(fleetPubkey);
    const fleetCargoStats = fleetAccount.data.stats.cargoStats as CargoStats;

    if (!fleetAccount.state.StarbaseLoadingBay)
      throw new Error("Fleet is not at starbase loading bay");

    // Player Profile
    const playerProfilePubkey = fleetAccount.data.ownerProfile;
    const sagePlayerProfilePubkey =
      await this._gameHandler.getSagePlayerProfileAddress(playerProfilePubkey);
    const profileFactionPubkey =
      this._gameHandler.getProfileFactionAddress(playerProfilePubkey);

    if (!sagePlayerProfilePubkey)
      throw new Error("Sage Player Profile not found");

    // Starbase where the fleet is located
    const starbasePubkey = fleetAccount.state.StarbaseLoadingBay
      .starbase as PublicKey;
    const starbaseAccount = await this.getStarbaseAccount(starbasePubkey);

    // PDA Starbase - Player
    const starbasePlayerPubkey = this._gameHandler.getStarbasePlayerAddress(
      starbasePubkey,
      sagePlayerProfilePubkey,
      starbaseAccount.data.seqId
    );
    const starbasePlayerAccount = await this._gameHandler.getStarbasePlayer(
      starbasePlayerPubkey
    );

    // This PDA account is the owner of all player resource token accounts
    // in the starbase where the fleet is located (Starbase Cargo Pods - Deposito merci nella Starbase)
    const starbasePlayerCargoPodsAccount =
      await this._gameHandler.getCargoPodsByAuthority(starbasePlayerPubkey);
    const starbasePlayerCargoPodsPubkey = starbasePlayerCargoPodsAccount.key;
    const tokenAccountFrom = (
      await this._gameHandler.getParsedTokenAccountsByOwner(
        starbasePlayerCargoPodsPubkey
      )
    ).find(
      (tokenAccount) => tokenAccount.mint.toBase58() === ammoMint.toBase58()
    );

    if (!tokenAccountFrom)
      throw new Error("Starbase player fuel token account not found");

    const tokenAccountFromPubkey = tokenAccountFrom.address;

    // This PDA account is the owner of all the resources in the fleet's cargo (Fleet Cargo Holds - Stiva della flotta)
    const fleetAmmoBankPubkey = fleetAccount.data.ammoBank;
    const tokenAccountTo = (
      await this._gameHandler.getParsedTokenAccountsByOwner(fleetAmmoBankPubkey)
    ).find(
      (tokenAccount) => tokenAccount.mint.toBase58() === ammoMint.toBase58()
    );
    const tokenAccountToATA = createAssociatedTokenAccountIdempotent(
      ammoMint,
      fleetAmmoBankPubkey,
      true
    );
    const tokenAccountToPubkey = tokenAccountToATA.address;

    const ix_0 = tokenAccountToATA.instructions;
    ixs.push(ix_0);

    // amount > fleet free capacity?
    let amountBN = BN.min(
      new BN(amount),
      tokenAccountTo
        ? new BN(fleetCargoStats.ammoCapacity).sub(
            new BN(tokenAccountTo.amount)
          )
        : new BN(fleetCargoStats.ammoCapacity)
    );
    // amount > starbase amount?
    amountBN = BN.min(amountBN, new BN(tokenAccountFrom.amount));

    /* if (amountBN <= 0)
      throw new Error(
        "Fleet ammo bank is full or the resource is no longer available in starbase"
      ); */

    const program = this._gameHandler.program;
    const cargoProgram = this._gameHandler.cargoProgram;
    const payer = this._gameHandler.funder;
    const payerPubkey = payer.publicKey();
    const gameId = this._gameHandler.gameId as PublicKey;
    const gameState = this._gameHandler.gameState as PublicKey;
    const input = { keyIndex: 0, amount: amountBN } as DepositCargoToFleetInput;
    const cargoType = this._gameHandler.getCargoTypeAddress(ammoMint);
    const cargoStatsDefinition = this._gameHandler
      .cargoStatsDefinition as PublicKey;

    const ix_1 = Fleet.depositCargoToFleet(
      program,
      cargoProgram,
      payer,
      playerProfilePubkey,
      profileFactionPubkey,
      payerPubkey,
      starbasePubkey,
      starbasePlayerPubkey,
      fleetPubkey,
      starbasePlayerCargoPodsPubkey,
      fleetAmmoBankPubkey,
      cargoType,
      cargoStatsDefinition,
      tokenAccountFromPubkey,
      tokenAccountToPubkey,
      ammoMint,
      gameId,
      gameState,
      input
    );

    ixs.push(ix_1);

    return ixs;
  }

  async ixWarpToCoordinate(
    fleetPubkey: PublicKey,
    coordinates: [BN, BN]
  ): Promise<InstructionReturn[]> {
    const fleetAccount = await this.getFleetAccount(fleetPubkey);

    // TODO: ensure fleet state is "Idle" - is there a better way to do this?
    if (!fleetAccount.state.Idle && !this._gameHandler.game) {
      throw "fleet is not idle (or game is not loaded)";
    }

    const ixs: InstructionReturn[] = [];

    const _ = this._gameHandler.getSectorAddress(coordinates);

    const gameFuelMint = this._gameHandler.game?.data.mints.fuel as PublicKey;

    const program = this._gameHandler.program;
    const key = this._gameHandler.funder;
    const playerProfile = fleetAccount.data.ownerProfile;
    const profileFaction =
      this._gameHandler.getProfileFactionAddress(playerProfile);
    const fleetKey = fleetPubkey;
    const fleetFuelTank = fleetAccount.data.fuelTank;
    const fuelCargoType = this._gameHandler.getCargoTypeAddress(gameFuelMint);
    const cargoStatsDefinition = this._gameHandler
      .cargoStatsDefinition as PublicKey;
    const tokenMint = gameFuelMint;
    const tokenFrom = await getAssociatedTokenAddress(
      tokenMint,
      fleetFuelTank,
      true
    );
    const gameState = this._gameHandler.gameState as PublicKey;
    const gameId = this._gameHandler.gameId as PublicKey;
    const cargoProgram = this._gameHandler.cargoProgram;
    const input = {
      keyIndex: 0, // FIXME: This is the index of the wallet used to sign the transaction in the permissions list of the player profile being used.
      toSector: coordinates,
    } as WarpToCoordinateInput;

    const ix_1 = Fleet.warpToCoordinate(
      program,
      key,
      playerProfile,
      profileFaction,
      fleetKey,
      fleetFuelTank,
      fuelCargoType,
      cargoStatsDefinition,
      tokenFrom,
      tokenMint,
      gameState,
      gameId,
      cargoProgram,
      input
    );

    ixs.push(ix_1);

    return ixs;
  }

  async ixReadyToExitWarp(
    fleetPubkey: PublicKey
  ): Promise<InstructionReturn[]> {
    const ixs: InstructionReturn[] = [];

    const ix_1 = Fleet.moveWarpHandler(this._gameHandler.program, fleetPubkey);

    ixs.push(ix_1);

    return ixs;
  }

  async ixSubwarpToCoordinate(
    fleetPubkey: PublicKey,
    coordinates: [BN, BN]
  ): Promise<InstructionReturn[]> {
    const fleetAccount = await this.getFleetAccount(fleetPubkey);

    // TODO: ensure fleet state is "Idle" - is there a better way to do this?
    if (!fleetAccount.state.Idle && !this._gameHandler.game) {
      throw "fleet is not idle (or game is not loaded)";
    }

    const ixs: InstructionReturn[] = [];

    const _ = this._gameHandler.getSectorAddress(coordinates);

    const program = this._gameHandler.program;
    const key = this._gameHandler.funder;
    const playerProfile = fleetAccount.data.ownerProfile;
    const profileFaction =
      this._gameHandler.getProfileFactionAddress(playerProfile);
    const fleetKey = fleetPubkey;
    const gameState = this._gameHandler.gameState as PublicKey;
    const gameId = this._gameHandler.gameId as PublicKey;
    const input = {
      keyIndex: 0, // FIXME: This is the index of the wallet used to sign the transaction in the permissions list of the player profile being used.
      toSector: coordinates,
    } as StartSubwarpInput;

    const ix_1 = Fleet.startSubwarp(
      program,
      key,
      playerProfile,
      profileFaction,
      fleetKey,
      gameId,
      gameState,
      input
    );

    ixs.push(ix_1);

    return ixs;
  }

  async ixReadyToExitSubwarp(
    fleetPubkey: PublicKey
  ): Promise<InstructionReturn[]> {
    const fleetAccount = await this.getFleetAccount(fleetPubkey);

    const ixs: InstructionReturn[] = [];

    const gameFuelMint = this._gameHandler.game?.data.mints.fuel as PublicKey;

    const program = this._gameHandler.program;
    const playerProfile = fleetAccount.data.ownerProfile;
    const fleetKey = fleetPubkey;
    const fleetFuelTank = fleetAccount.data.fuelTank;
    const fuelCargoType = this._gameHandler.getCargoTypeAddress(gameFuelMint);
    const cargoStatsDefinition = this._gameHandler
      .cargoStatsDefinition as PublicKey;
    const tokenMint = gameFuelMint;
    const tokenFrom = await getAssociatedTokenAddress(
      tokenMint,
      fleetFuelTank,
      true
    );
    const gameState = this._gameHandler.gameState as PublicKey;
    const gameId = this._gameHandler.gameId as PublicKey;
    const cargoProgram = this._gameHandler.cargoProgram;

    const ix_1 = Fleet.movementSubwarpHandler(
      program,
      cargoProgram,
      playerProfile,
      fleetKey,
      fleetFuelTank,
      fuelCargoType,
      cargoStatsDefinition,
      tokenFrom,
      tokenMint,
      gameId,
      gameState
    );

    ixs.push(ix_1);

    return ixs;
  }
}
