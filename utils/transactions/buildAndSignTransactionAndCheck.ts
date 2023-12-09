import { InstructionReturn } from "@staratlas/data-source";
import {
  BuildAndSignTransactionError,
  NoEnoughTokensToPerformLabsAction,
} from "../../common/errors";
import { sageProvider } from "../sageProvider";

export const buildAndSignTransactionAndCheck = async (
  ix: InstructionReturn[]
) => {
  const { sageGameHandler } = await sageProvider();

  let tx = await sageGameHandler.buildAndSignTransaction(ix);

  if (tx.type !== "Success") {
    switch (tx.type) {
      case "NoEnoughTokensToPerformLabsAction":
        console.log("No enough QTR to perform labs action");
        throw new NoEnoughTokensToPerformLabsAction();
      case "BuildAndSignTransactionError":
        console.log("Error in building and signing this transaction");
        throw new BuildAndSignTransactionError();
    }
  }

  return tx.stx;
};
