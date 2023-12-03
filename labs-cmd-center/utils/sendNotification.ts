import { NotificationMessage } from "../common/notifications";
import { ResourceType } from "../common/resources";

export const sendNotification = async (
  notification: NotificationMessage,
  fleetName?: string,
  resourceName?: ResourceType,
  amount?: number
) => {
  if (Bun.env.NOTIFICATION_HOOK) {
    const url = Bun.env.NOTIFICATION_HOOK as string;
    const payload = {
      message: fleetName ? `${fleetName}: ${notification}` : notification,
      resourceName,
      amount,
      fleetName,
    };
    const headers = { "Content-Type": "application/json" };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (response.status === 200) {
        console.log("Notification sent successfully.");
      } else {
        console.log(
          `Failed to send notification. Status code: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  } else {
    console.log(fleetName ? `${fleetName}: ${notification}` : notification);
  }
};
