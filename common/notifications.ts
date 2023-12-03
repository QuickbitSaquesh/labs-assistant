export enum NotificationMessage {
  CARGO_SUCCESS = "Ciclo di TRASPORTO completato con SUCCESSO",
  MINING_SUCCESS = "Ciclo di ESTRAZIONE completato con SUCCESSO",
  MINING_CARGO_SUCCESS = "Ciclo di ESTRAZIONE e TRASPORTO completato con SUCCESSO",
  CARGO_ERROR = "Si è verificato un ERRORE durante il TRASPORTO",
  MINING_ERROR = "Si è verificato un ERRORE durante l'ESTRAZIONE",
  MINING_CARGO_ERROR = "Si è verificato un ERRORE durante il ciclo di ESTRAZIONE e TRASPORTO",
  SCAN_ERROR = "Si è verificato un ERRORE durante la SCANSIONE",
  FAIL_WARNING = "Un'azione è FALLITA e si sta RIPETENDO. Se il problema persiste, intervieni per risolvere il problema",
  SCAN_SUCCESS = "Gli SDU sono stati depositati in Starbase con SUCCESSO",
}
