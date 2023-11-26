import { dockToStarbase } from "../actions/dockToStarbase";
import { exitSubwarp } from "../actions/exitSubwarp";
import { loadAmmo } from "../actions/loadAmmo";
import { loadCargo } from "../actions/loadCargo";
import { loadFuel } from "../actions/loadFuel";
import { startMining } from "../actions/startMining";
import { stopMining } from "../actions/stopMining";
import { subwarpToSector } from "../actions/subwarpToSector";
import { undockFromStarbase } from "../actions/undockFromStarbase";
import { unloadCargo } from "../actions/unloadCargo";
import { NotificationMessage } from "../common/notifications";
import { Resources } from "../common/resources";
import { actionWrapper } from "../utils/actionWrapper";
import { sendNotification } from "../utils/sendNotification";

const run = async () => {
  const fleetName = "Flotta BETA";
  while (true) {
    try {
      await actionWrapper(loadFuel, fleetName, 999_999);
      await actionWrapper(loadAmmo, fleetName, 999_999);
      await actionWrapper(loadCargo, fleetName, Resources.Food, 1414);
      await actionWrapper(undockFromStarbase, fleetName);
      await actionWrapper(subwarpToSector, fleetName, 2, 5, 1313);
      await actionWrapper(exitSubwarp, fleetName);
      await actionWrapper(startMining, fleetName, Resources.IronOre, 3447);
      await actionWrapper(stopMining, fleetName, Resources.IronOre);
      await actionWrapper(subwarpToSector, fleetName, -2, -5, 1313);
      await actionWrapper(exitSubwarp, fleetName);
      await actionWrapper(dockToStarbase, fleetName);
      await actionWrapper(unloadCargo, fleetName, Resources.IronOre, 999_999);
      await sendNotification(NotificationMessage.MINING_CARGO_SUCCESS);
    } catch (e) {
      await sendNotification(NotificationMessage.MINING_CARGO_ERROR);
    }
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
