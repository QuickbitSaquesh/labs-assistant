import { SendTransactionFailed } from "../../common/errors";
import { sageProvider } from "../sageProvider";

export const sendTransactionAndCheck = async (
  tx: TransactionReturn,
  errorMessage?: string
) => {
  const { sageGameHandler } = await sageProvider();

  let rx = await sageGameHandler.sendTransaction(tx);

  if (rx.type !== "Success") {
    console.log(
      `${errorMessage}. Error code: ${rx.result}` ??
        `Transaction failed to send. Error code: ${rx.result}`
    );
    throw new SendTransactionFailed();
  }

  return rx.result;
};
