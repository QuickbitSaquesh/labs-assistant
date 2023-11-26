import { dockToStarbase } from "../actions/dockToStarbase";
import { loadAmmo } from "../actions/loadAmmo";
import { loadCargo } from "../actions/loadCargo";
import { loadFuel } from "../actions/loadFuel";
import { startMining } from "../actions/startMining";
import { stopMining } from "../actions/stopMining";
import { undockFromStarbase } from "../actions/undockFromStarbase";
import { unloadCargo } from "../actions/unloadCargo";
import { NotificationMessage } from "../common/notifications";
import { Resources } from "../common/resources";
import { actionWrapper } from "../utils/actionWrapper";
import { sendNotification } from "../utils/sendNotification";

const run = async () => {
  const fleetName = "Flotta GAMMA";
  while (true) {
    try {
      await actionWrapper(loadFuel, fleetName, 999_999);
      await actionWrapper(loadAmmo, fleetName, 999_999);
      await actionWrapper(loadCargo, fleetName, Resources.Food, 631);
      await actionWrapper(undockFromStarbase, fleetName);
      await actionWrapper(startMining, fleetName, Resources.Carbon, 1377);
      await actionWrapper(stopMining, fleetName, Resources.Carbon);
      await actionWrapper(dockToStarbase, fleetName);
      await actionWrapper(unloadCargo, fleetName, Resources.Carbon, 999_999);
      await sendNotification(NotificationMessage.MINING_SUCCESS);
    } catch (e) {
      await sendNotification(NotificationMessage.MINING_ERROR);
    }
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
