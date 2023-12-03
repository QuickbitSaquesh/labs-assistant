import { Resources, ResourcesKey } from "../common/resources";
import { StarbasesKey, findStarbaseNameByCoords } from "../common/starbases";
import { FleetData } from "../common/types";
import { Starbases } from "./../common/starbases";
import { askQuestion } from "./askQuestion";
import { getFleetData } from "./getFleetData";

export const inputFleetAndResource = async () => {
  let fleetName: string;
  let fleet: FleetData;
  let resource: ResourcesKey;

  let currentStarbaseName;
  let mineStarbaseName;

  while (true) {
    fleetName = await askQuestion("Inserisci il nome della flotta: "); // Nome della flotta
    try {
      fleet = await getFleetData(fleetName);
      if (
        !fleet.currentSector ||
        !fleet.fleetAccount.state.StarbaseLoadingBay
      ) {
        console.log(
          "La flotta che hai scelto non si trova parcheggiata in nessuna starbase. Per favore riprova."
        );
        console.log("");
        continue;
      }
      currentStarbaseName = findStarbaseNameByCoords(fleet.currentSector);
      console.log(
        `Ottimo. Hai selezionato la flotta ${fleet.fleetName} che si trova in ${currentStarbaseName}`
      );
      console.log("");
    } catch (e) {
      console.log(e);
      continue;
    }
    break;
  }

  while (true) {
    resource = (await askQuestion(
      "Inserisci la risorsa che vuoi minare: "
    )) as ResourcesKey; // Risorsa da minare
    if (!Resources[resource]) continue;
    break;
  }

  while (true) {
    mineStarbaseName = (await askQuestion(
      "Inserisci la starbase in cui vuoi minare: "
    )) as StarbasesKey; // Starbase in cui minare
    if (!Starbases[mineStarbaseName]) continue;
    break;
  }

  return currentStarbaseName === mineStarbaseName
    ? { fleetName, fleet, resource }
    : {
        fleetName,
        fleet,
        resource,
        starbaseFrom: fleet.currentSector,
        starbaseTo: Starbases[mineStarbaseName],
      };
};
