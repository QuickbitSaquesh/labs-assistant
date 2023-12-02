// 1. inserisci il nome della flotta
// 2. inserisci la risorsa che desideri minare
// 3. inserisci in quale starbase la vuoi minare

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
import { inputFleetAndResource } from "../utils/inputFleetAndResource";
import { prepareForMining } from "../utils/prepareForMining";
import { sendNotification } from "../utils/sendNotification";

const run = async () => {
  const { fleetName, fleet, resource, starbaseFrom, starbaseTo } =
    await inputFleetAndResource();

  const miningTimeAndResourcesAmount = !starbaseTo
    ? await prepareForMining(
        fleetName,
        Resources[resource],
        fleet.currentSector
      )
    : await prepareForMining(
        fleetName,
        Resources[resource],
        starbaseTo as [number, number]
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
      if (starbaseTo) {
        await actionWrapper(
          subwarpToSector,
          fleetName,
          starbaseTo as [number, number]
        );
        await actionWrapper(exitSubwarp, fleetName);
      }
      await actionWrapper(
        startMining,
        fleetName,
        Resources[resource],
        miningTimeAndResourcesAmount.timeInSeconds
      );
      await actionWrapper(stopMining, fleetName, Resources[resource]);
      if (starbaseFrom) {
        await actionWrapper(
          subwarpToSector,
          fleetName,
          starbaseFrom as [number, number]
        );
        await actionWrapper(exitSubwarp, fleetName);
      }
      await actionWrapper(dockToStarbase, fleetName);
      await actionWrapper(
        unloadCargo,
        fleetName,
        Resources[resource],
        MAX_AMOUNT
      );
      await sendNotification(NotificationMessage.MINING_SUCCESS, fleetName);
    } catch (e) {
      await sendNotification(NotificationMessage.MINING_ERROR, fleetName);
    }
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
