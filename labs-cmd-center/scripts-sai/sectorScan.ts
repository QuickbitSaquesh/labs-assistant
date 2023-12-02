import * as readline from "readline";
import { dockToStarbase } from "../actions/dockToStarbase";
import { exitSubwarp } from "../actions/exitSubwarp";
import { loadCargo } from "../actions/loadCargo";
import { loadFuel } from "../actions/loadFuel";
import { scan } from "../actions/scan";
import { subwarpToSector } from "../actions/subwarpToSector";
import { undockFromStarbase } from "../actions/undockFromStarbase";
import { unloadCargo } from "../actions/unloadCargo";
import { MAX_AMOUNT } from "../common/constants";
import { NoEnoughRepairKits } from "../common/errors";
import { NotificationMessage } from "../common/notifications";
import { Resources } from "../common/resources";
import { FleetScan } from "../common/types";
import { actionWrapper } from "../utils/actionWrapper";
import { sendNotification } from "../utils/sendNotification";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

const getFleetDetails = async (): Promise<FleetScan> => {
  const name = await askQuestion("Enter fleet name: ");
  const x = parseInt(await askQuestion("Enter fleet X coordinate: "), 10);
  const y = parseInt(await askQuestion("Enter fleet Y coordinate: "), 10);
  const time = parseInt(await askQuestion("Enter fleet time: "), 10);
  const scanCooldown = parseInt(
    await askQuestion("Enter scan cooldown time (in seconds): "),
    10
  );

  return { name, x, y, time, scanCooldown };
};

const backToStarbase = async (fleet: FleetScan) => {
  await actionWrapper(
    subwarpToSector,
    fleet.name,
    fleet.x * -1,
    fleet.y * -1,
    fleet.time
  );
  await actionWrapper(exitSubwarp, fleet.name);
  await actionWrapper(dockToStarbase, fleet.name);
  await actionWrapper(unloadCargo, fleet.name, Resources.Sdu, MAX_AMOUNT);
  await sendNotification(NotificationMessage.SCAN_SUCCESS, fleet.name);
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const scheduleScan = async (fleet: FleetScan) => {
  try {
    await scan(fleet.name);
    console.log(`Waiting for ${fleet.scanCooldown} seconds (scan cooldown)...`);
    await delay(fleet.scanCooldown * 1000);
    await scheduleScan(fleet);
  } catch (e) {
    if (e instanceof NoEnoughRepairKits) {
      console.log("No enough repair kits to continue scanning");
      await backToStarbase(fleet);
    } else {
      throw e;
    }
  }
};

const run = async () => {
  console.log("Scan operations setup...");
  const fleet = await getFleetDetails();

  console.log("Scan operations started!");
  while (true) {
    try {
      await actionWrapper(loadCargo, fleet.name, Resources.Tool, MAX_AMOUNT);
      await actionWrapper(loadFuel, fleet.name, MAX_AMOUNT);
      await actionWrapper(undockFromStarbase, fleet.name);
      await actionWrapper(
        subwarpToSector,
        fleet.name,
        fleet.x,
        fleet.y,
        fleet.time
      );
      await actionWrapper(exitSubwarp, fleet.name);
      await actionWrapper(scheduleScan, fleet);
    } catch (e) {
      console.log(e);
      await sendNotification(NotificationMessage.SCAN_ERROR);
    }
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
