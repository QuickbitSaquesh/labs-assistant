import { NotificationMessage } from "../common/notifications";
import { ResourcesType } from "../common/resources";

export const sendNotification = async (
  notification: NotificationMessage,
  fleetName?: string,
  resource?: ResourcesType,
  amount?: number
) => {
  if (Bun.env.MAKE_HOOK) {
    const url = Bun.env.MAKE_HOOK as string;
    const payload = {
      message: fleetName ? `${fleetName}: ${notification}` : notification,
      resource,
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
