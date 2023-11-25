import { dockToStarbase } from "../actions/dockToStarbase";
import { exitSubwarp } from "../actions/exitSubwarp";
import { loadCargo } from "../actions/loadCargo";
import { scan } from "../actions/scan";
import { subwarpToSector } from "../actions/subwarpToSector";
import { undockFromStarbase } from "../actions/undockFromStarbase";
import { unloadCargo } from "../actions/unloadCargo";
import { NoEnoughRepairKits } from "../common/errors";
import { Resources } from "../common/resources";

const run = async () => {
  // const fleetNameSCAN = "Flotta SCAN";
  const fleetNameSDU1 = "Flotta SDU 1";

  const scheduleScan = async (fleetName: string, scanCooldown: number) => {
    try {
      await scan(fleetName);
    } catch (e) {
      if (e instanceof NoEnoughRepairKits) {
        return;
      }
    } finally {
      setTimeout(() => scheduleScan(fleetName, scanCooldown), scanCooldown);
    }
  };

  //scheduleScan(fleetNameSCAN, 41000);

  loadCargo(fleetNameSDU1, Resources.Tool, 4926);
  undockFromStarbase(fleetNameSDU1);
  subwarpToSector(fleetNameSDU1, 8, 1, 1260);
  exitSubwarp(fleetNameSDU1);
  await scheduleScan(fleetNameSDU1, 56000);
  subwarpToSector(fleetNameSDU1, -8, -1, 1260);
  exitSubwarp(fleetNameSDU1);
  dockToStarbase(fleetNameSDU1);
  unloadCargo(fleetNameSDU1, Resources.Sdu);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
