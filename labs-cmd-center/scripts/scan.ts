import { dockToStarbase } from "../actions/dockToStarbase";
import { exitSubwarp } from "../actions/exitSubwarp";
import { loadCargo } from "../actions/loadCargo";
import { loadFuel } from "../actions/loadFuel";
import { scan } from "../actions/scan";
import { subwarpToSector } from "../actions/subwarpToSector";
import { undockFromStarbase } from "../actions/undockFromStarbase";
import { unloadCargo } from "../actions/unloadCargo";
import { NoEnoughRepairKits } from "../common/errors";
import { NotificationMessage } from "../common/notifications";
import { Resources } from "../common/resources";
import { actionWrapper } from "../utils/actionWrapper";
import { sendNotification } from "../utils/sendNotification";

const runScan = async (
  fleetName: string,
  x: number,
  y: number,
  time: number,
  scanCooldown: number
) => {
  await actionWrapper(loadCargo, fleetName, Resources.Tool, 999_999);
  await actionWrapper(loadFuel, fleetName, 999_999);
  await actionWrapper(undockFromStarbase, fleetName);
  await actionWrapper(subwarpToSector, fleetName, x, y, time);
  await actionWrapper(exitSubwarp, fleetName);
  await actionWrapper(scheduleScan, fleetName, scanCooldown, x, y, time);
};

const backToStarbase = async (
  fleetName: string,
  x: number,
  y: number,
  time: number
) => {
  await actionWrapper(subwarpToSector, fleetName, x * -1, y * -1, time);
  await actionWrapper(exitSubwarp, fleetName);
  await actionWrapper(dockToStarbase, fleetName);
  await actionWrapper(unloadCargo, fleetName, Resources.Sdu, 999_999);
  await sendNotification(NotificationMessage.SCAN_SUCCESS);
};

const scheduleScan = async (
  fleetName: string,
  scanCooldown: number,
  x: number,
  y: number,
  time: number
) => {
  try {
    await scan(fleetName);
    setTimeout(
      () => scheduleScan(fleetName, scanCooldown, x, y, time),
      scanCooldown * 1000
    );
  } catch (e) {
    if (e instanceof NoEnoughRepairKits) {
      console.log("No enough repair kits to continue scanning.");
      backToStarbase(fleetName, x, y, time);
      return;
    }
    throw e;
  }
};

const run = async () => {
  const fleets = [
    { name: "Flotta SCAN", x: -3, y: 5, time: 1241, scanCooldown: 41 },
    { name: "Flotta SDU 1", x: 1, y: 8, time: 1260, scanCooldown: 56 },
    { name: "Flotta SDU 2", x: -7, y: 4, time: 1260, scanCooldown: 57 },
    { name: "Flotta SDU 3", x: -6, y: 5, time: 1220, scanCooldown: 56 },
  ];

  while (true) {
    try {
      console.log("Scan operations started!");
      const fleetScans = fleets.map((fleet) =>
        runScan(fleet.name, fleet.x, fleet.y, fleet.time, fleet.scanCooldown)
      );
      await Promise.allSettled(fleetScans);
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
