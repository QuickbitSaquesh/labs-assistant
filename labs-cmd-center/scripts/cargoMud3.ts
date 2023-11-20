import { dockToStarbase } from "../actions/dockToStarbase";
import { exitSubwarp } from "../actions/exitSubwarp";
import { loadCargo } from "../actions/loadCargo";
import { loadFuel } from "../actions/loadFuel";
import { subwarpToSector } from "../actions/subwarpToSector";
import { undockFromStarbase } from "../actions/undockFromStarbase";
import { unloadCargo } from "../actions/unloadCargo";
import { NotificationMessage } from "../common/notifications";
import { Resources } from "../common/resources";
import { actionWrapper } from "../utils/actionWrapper";
import { sendNotification } from "../utils/sendNotification";

const run = async () => {
  const fleetName = Bun.env.CARGO_FLEET_NAME as string;
  while (true) {
    try {
      await actionWrapper(loadCargo, fleetName, Resources.Carbon, 158817);
      await actionWrapper(undockFromStarbase, fleetName);
      await actionWrapper(subwarpToSector, fleetName, -10, 2, 2170);
      await actionWrapper(exitSubwarp, fleetName);
      await actionWrapper(dockToStarbase, fleetName);
      await actionWrapper(unloadCargo, fleetName, Resources.Carbon, 158817);
      await sendNotification(NotificationMessage.CARGO_SUCCESS);
      await actionWrapper(loadFuel, fleetName, 131241);
      // await actionWrapper(loadAmmo, fleetName, ?);
      // await actionWrapper(loadCargo, fleetName, ?);
      // ammo, food
      await actionWrapper(undockFromStarbase, fleetName);
      await actionWrapper(subwarpToSector, fleetName, 10, -2, 2170);
      await actionWrapper(exitSubwarp, fleetName);
      await actionWrapper(dockToStarbase, fleetName);
    } catch (e) {
      await sendNotification(NotificationMessage.CARGO_ERROR);
    }
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
