import { dockToStarbase } from "../actions/dockToStarbase";
import { exitWarp } from "../actions/exitWarp";
import { loadCargo } from "../actions/loadCargo";
import { loadFuel } from "../actions/loadFuel";
import { undockFromStarbase } from "../actions/undockFromStarbase";
import { unloadCargo } from "../actions/unloadCargo";
import { warpToSector } from "../actions/warpToSector";
import { NotificationMessage } from "../common/notifications";
import { Resources } from "../common/resources";
import { actionWrapper } from "../utils/actionWrapper";
import { sendNotification } from "../utils/sendNotification";

const run = async () => {
  const fleetName = Bun.env.CARGO_FLEET_NAME as string;
  while (true) {
    try {
      await actionWrapper(loadFuel, fleetName, 131241);
      await actionWrapper(undockFromStarbase, fleetName);
      await actionWrapper(warpToSector, fleetName, 0, 10, 100, 300, true);
      await actionWrapper(exitWarp, fleetName);
      await actionWrapper(warpToSector, fleetName, 2, 6, 63, 300, true);
      await actionWrapper(exitWarp, fleetName);
      await actionWrapper(dockToStarbase, fleetName);
      await actionWrapper(loadCargo, fleetName, Resources.Carbon, 158817);
      await actionWrapper(undockFromStarbase, fleetName);
      await actionWrapper(warpToSector, fleetName, 0, -10, 100, 300, true);
      await actionWrapper(exitWarp, fleetName);
      await actionWrapper(warpToSector, fleetName, -2, -6, 63, 300, true);
      await actionWrapper(exitWarp, fleetName);
      await actionWrapper(dockToStarbase, fleetName);
      await actionWrapper(unloadCargo, fleetName, Resources.Carbon, 158817);
      await sendNotification(NotificationMessage.CARGO_SUCCESS);
    } catch (e) {
      await sendNotification(NotificationMessage.CARGO_ERROR);
    }
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
