import { NotificationMessage } from "../common/notifications";
import { LabsAction } from "../common/types";
import { sendNotification } from "./sendNotification";

// If a SAGE Labs action fails, send a notification and retry the same action every minute
export async function actionWrapper<R, A extends any[]>(
  func: LabsAction<R, A>,
  ...args: A
): Promise<R> {
  while (true) {
    try {
      return await func(...args);
    } catch (error) {
      console.error(`Attempt failed:`, error);
      sendNotification(NotificationMessage.FAIL_WARNING);
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }
  }
}
