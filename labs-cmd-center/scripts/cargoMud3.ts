import { dockToStarbase } from "../actions/dockToStarbase";
import { exitSubwarp } from "../actions/exitSubwarp";
import { loadAmmo } from "../actions/loadAmmo";
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
  const fleetName = "Flotta CARGO";
  while (true) {
    try {
      await actionWrapper(loadFuel, fleetName, 999_999);
      await actionWrapper(loadAmmo, fleetName, 999_999);
      await actionWrapper(loadCargo, fleetName, Resources.Food, 1893);
      await actionWrapper(loadCargo, fleetName, Resources.Ammo, 8019);
      await actionWrapper(loadCargo, fleetName, Resources.Fuel, 1362);
      await actionWrapper(undockFromStarbase, fleetName);
      await actionWrapper(subwarpToSector, fleetName, 10, -2);
      await actionWrapper(exitSubwarp, fleetName);
      await actionWrapper(dockToStarbase, fleetName);
      await actionWrapper(unloadCargo, fleetName, Resources.Food, 1893);
      await actionWrapper(unloadCargo, fleetName, Resources.Ammo, 8019);
      await actionWrapper(unloadCargo, fleetName, Resources.Fuel, 1362);
      await actionWrapper(loadCargo, fleetName, Resources.Carbon, 999_999);
      await actionWrapper(undockFromStarbase, fleetName);
      await actionWrapper(subwarpToSector, fleetName, -10, 2);
      await actionWrapper(exitSubwarp, fleetName);
      await actionWrapper(dockToStarbase, fleetName);
      await actionWrapper(unloadCargo, fleetName, Resources.Carbon, 999_999);
      await sendNotification(
        NotificationMessage.CARGO_SUCCESS,
        fleetName,
        Resources.Carbon,
        158817
      );
    } catch (e) {
      await sendNotification(NotificationMessage.CARGO_ERROR, fleetName);
    }
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
