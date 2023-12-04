import { dockToStarbase } from "../actions/dockToStarbase";
import { exitSubwarp } from "../actions/exitSubwarp";
import { loadAmmo } from "../actions/loadAmmo";
import { loadCargo } from "../actions/loadCargo";
import { loadFuel } from "../actions/loadFuel";
import { subwarpToSector } from "../actions/subwarpToSector";
import { undockFromStarbase } from "../actions/undockFromStarbase";
import { unloadCargo } from "../actions/unloadCargo";
import { MAX_AMOUNT } from "../common/constants";
import { NotificationMessage } from "../common/notifications";
import { SectorCoordinates } from "../common/types";
import { actionWrapper } from "../utils/actionWrapper";
import { calcSectorsDistanceByCoords } from "../utils/calcSectorsDistanceByCoords";
import { inputForCargo } from "../utils/inputForCargo";
import { sendNotification } from "../utils/sendNotification";

const run = async () => {
  const {
    fleetName,
    fleetData,
    sectorTo,
    resourcesToDestination,
    resourcesToStarbase,
  } = await inputForCargo();

  const distanceCoords =
    sectorTo && calcSectorsDistanceByCoords(fleetData.currentSector, sectorTo);

  const reverseDistanceCoords =
    distanceCoords &&
    (distanceCoords.map((item) => item.neg()) as SectorCoordinates);

  while (true) {
    try {
      await actionWrapper(loadFuel, fleetName, MAX_AMOUNT);
      await actionWrapper(loadAmmo, fleetName, MAX_AMOUNT);

      for (const item of resourcesToDestination) {
        await actionWrapper(loadCargo, fleetName, item.resource, item.amount);
      }

      await actionWrapper(undockFromStarbase, fleetName);
      await actionWrapper(subwarpToSector, fleetName, distanceCoords);
      await actionWrapper(exitSubwarp, fleetName);
      await actionWrapper(dockToStarbase, fleetName);

      for (const item of resourcesToDestination) {
        await actionWrapper(unloadCargo, fleetName, item.resource, item.amount);
      }

      for (const item of resourcesToStarbase) {
        await actionWrapper(loadCargo, fleetName, item.resource, item.amount);
      }

      await actionWrapper(undockFromStarbase, fleetName);
      await actionWrapper(subwarpToSector, fleetName, reverseDistanceCoords);
      await actionWrapper(exitSubwarp, fleetName);
      await actionWrapper(dockToStarbase, fleetName);

      for (const item of resourcesToStarbase) {
        await actionWrapper(unloadCargo, fleetName, item.resource, item.amount);
      }

      await sendNotification(NotificationMessage.CARGO_SUCCESS, fleetName);
    } catch (e) {
      await sendNotification(NotificationMessage.CARGO_ERROR, fleetName);
    }
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
