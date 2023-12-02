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
import { MAX_AMOUNT } from "../common/constants";
import { NotificationMessage } from "../common/notifications";
import { Resources } from "../common/resources";
import { actionWrapper } from "../utils/actionWrapper";
import { prepareForMining } from "../utils/prepareForMining";
import { sendNotification } from "../utils/sendNotification";

const run = async () => {
  const fleetName = "Flotta BETA";
  const miningTimeAndResourcesAmount = await prepareForMining(
    fleetName,
    Resources.IronOre,
    [2, -34]
  );
  while (true) {
    try {
      await actionWrapper(loadFuel, fleetName, MAX_AMOUNT);
      await actionWrapper(loadAmmo, fleetName, MAX_AMOUNT);
      await actionWrapper(
        loadCargo,
        fleetName,
        Resources.Food,
        miningTimeAndResourcesAmount.food
      );
      await actionWrapper(undockFromStarbase, fleetName);
      await actionWrapper(subwarpToSector, fleetName, 2, 5);
      await actionWrapper(exitSubwarp, fleetName);
      await actionWrapper(
        startMining,
        fleetName,
        Resources.IronOre,
        miningTimeAndResourcesAmount.timeInSeconds
      );
      await actionWrapper(stopMining, fleetName, Resources.IronOre);
      await actionWrapper(subwarpToSector, fleetName, -2, -5);
      await actionWrapper(exitSubwarp, fleetName);
      await actionWrapper(dockToStarbase, fleetName);
      await actionWrapper(
        unloadCargo,
        fleetName,
        Resources.IronOre,
        MAX_AMOUNT
      );
      await sendNotification(
        NotificationMessage.MINING_CARGO_SUCCESS,
        fleetName,
        Resources.IronOre,
        76569
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
