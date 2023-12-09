import { cargo } from "./scripts/cargo";
import { mining } from "./scripts/mining";
import { setActivity } from "./utils/inputs/setActivity";
import { setFleet } from "./utils/inputs/setFleet";
import { setKeypair } from "./utils/inputs/setKeypair";
import { setRpc } from "./utils/inputs/setRpc";
import { sageProvider } from "./utils/sageProvider";

const main = async () => {
  await setKeypair();
  await setRpc();

  const { sageGameHandler } = await sageProvider();

  const qttrBalance = await sageGameHandler.getQuattrinoBalance();
  if (qttrBalance.type !== "Success" || qttrBalance.tokenBalance == 0) return;
  // 0. prima di lanciare lo script, prendere come argomenti la pb e sk del wallet e il nodo rpc
  // 1. prendere in input tutti i dati necessari per eseguire il tool
  // - flotta da utilizzare
  const fleet = await setFleet();
  if (fleet.type !== "Success") return;
  // 2. selezionare il tipo di attività che si desidera svolgere
  // - mining (con cargo)
  // - cargo (solo)
  // - sdu
  // - crafting (soon)
  const activity = await setActivity();
  // 3. eseguire l'attività selezionata dall'utente
  switch (activity) {
    case "Mining":
      await mining(fleet.fleet, fleet.position);
      break;
    case "Cargo":
      await cargo(fleet.fleet, fleet.position);
      break;
    default:
      return;
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
