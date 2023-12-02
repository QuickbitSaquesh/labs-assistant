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
import { prepareForMining } from "../utils/prepareForMining";
import { sendNotification } from "../utils/sendNotification";

const run = async () => {
  const fleetName = "CesenaLama";
  const miningTimeAndResourcesAmount = await prepareForMining(
    fleetName,
    Resources.CopperOre,
    [49, 20]
  );
  while (true) {
    try {
      await actionWrapper(loadFuel, fleetName, 999_999);
      await actionWrapper(loadAmmo, fleetName, 999_999);
      await actionWrapper(
        loadCargo,
        fleetName,
        Resources.Food,
        miningTimeAndResourcesAmount.food
      );
      await actionWrapper(undockFromStarbase, fleetName);
      await actionWrapper(subwarpToSector, fleetName, 9, -10);
      await actionWrapper(exitSubwarp, fleetName);
      await actionWrapper(
        startMining,
        fleetName,
        Resources.CopperOre,
        miningTimeAndResourcesAmount.timeInSeconds
      );
      await actionWrapper(stopMining, fleetName, Resources.CopperOre);
      await actionWrapper(subwarpToSector, fleetName, -9, 10);
      await actionWrapper(exitSubwarp, fleetName);
      await actionWrapper(dockToStarbase, fleetName);
      await actionWrapper(unloadCargo, fleetName, Resources.CopperOre, 999_999);
      await sendNotification(
        NotificationMessage.MINING_CARGO_SUCCESS,
        fleetName
      );
    } catch (e) {
      await sendNotification(NotificationMessage.MINING_CARGO_ERROR, fleetName);
    }
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
