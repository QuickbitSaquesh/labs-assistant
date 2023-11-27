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

const run = async () => {
  const fleetName = "MantovaSpina";
  while (true) {
    try {
      await actionWrapper(loadFuel, fleetName, 999_999);
      await actionWrapper(loadAmmo, fleetName, 999_999);
      await actionWrapper(loadCargo, fleetName, Resources.Food, 7750);
      await actionWrapper(undockFromStarbase, fleetName);
      await actionWrapper(startMining, fleetName, Resources.Arco, 7517);
      await actionWrapper(stopMining, fleetName, Resources.Arco);
      await actionWrapper(dockToStarbase, fleetName);
      await actionWrapper(unloadCargo, fleetName, Resources.Arco, 999_999);
      console.log(NotificationMessage.MINING_SUCCESS);
      // await sendNotification(NotificationMessage.MINING_SUCCESS);
    } catch (e) {
      console.log(NotificationMessage.MINING_ERROR);
      // await sendNotification(NotificationMessage.MINING_ERROR);
    }
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
