import { SendTransactionFailed } from "../../common/errors";
import { sageProvider } from "../sageProvider";

export const sendTransactionAndCheck = async (
  tx: TransactionReturn,
  errorMessage?: string
) => {
  const { sageGameHandler } = await sageProvider();

  let rx = await sageGameHandler.sendTransaction(tx);

  if (rx.type !== "Success") {
    errorMessage
      ? console.log(`${errorMessage}`)
      : console.log(`Transaction failed to send`);
    throw new SendTransactionFailed();
  }

  return rx.result;
};
