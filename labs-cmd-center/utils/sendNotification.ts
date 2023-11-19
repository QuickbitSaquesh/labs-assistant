import { NotificationMessage } from "../common/notifications";

export const sendNotification = async (notification: NotificationMessage) => {
  const url = Bun.env.MAKE_HOOK as string;
  const payload = { message: notification };
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
};
