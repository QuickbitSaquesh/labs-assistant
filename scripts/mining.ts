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
import { Resource } from "../common/resources";
import { SectorCoordinates } from "../common/types";
import { actionWrapper } from "../utils/actionWrapper";
import { calcSectorsDistanceByCoords } from "../utils/calcSectorsDistanceByCoords";
import { inputForMining } from "../utils/inputForMining";
import { prepareForMining } from "../utils/prepareForMining";
import { sendNotification } from "../utils/sendNotification";

const run = async () => {
  const { fleetName, fleetData, resourceToMine, sectorTo } =
    await inputForMining();

  const miningTimeAndResourcesAmount = !sectorTo
    ? await prepareForMining(
        fleetName,
        Resource[resourceToMine],
        fleetData.currentSector
      )
    : await prepareForMining(fleetName, Resource[resourceToMine], sectorTo);

  const distanceCoords =
    sectorTo && calcSectorsDistanceByCoords(fleetData.currentSector, sectorTo);

  const reverseDistanceCoords =
    distanceCoords &&
    (distanceCoords.map((item) => item.neg()) as SectorCoordinates);

  while (true) {
    try {
      await actionWrapper(loadFuel, fleetName, MAX_AMOUNT);
      await actionWrapper(loadAmmo, fleetName, MAX_AMOUNT);
      await actionWrapper(
        loadCargo,
        fleetName,
        Resource.Food,
        miningTimeAndResourcesAmount.food
      );
      await actionWrapper(undockFromStarbase, fleetName);
      if (sectorTo && distanceCoords) {
        await actionWrapper(subwarpToSector, fleetName, distanceCoords);
        await actionWrapper(exitSubwarp, fleetName);
      }
      await actionWrapper(
        startMining,
        fleetName,
        Resource[resourceToMine],
        miningTimeAndResourcesAmount.timeInSeconds
      );
      await actionWrapper(stopMining, fleetName, Resource[resourceToMine]);
      if (sectorTo && reverseDistanceCoords) {
        await actionWrapper(subwarpToSector, fleetName, reverseDistanceCoords);
        await actionWrapper(exitSubwarp, fleetName);
      }
      await actionWrapper(dockToStarbase, fleetName);
      await actionWrapper(
        unloadCargo,
        fleetName,
        Resource[resourceToMine],
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
