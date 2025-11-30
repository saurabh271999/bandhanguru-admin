import { apiUrls } from "@/apis";

export const logUserActivity = async (
  postQuery,
  userId,
  actionType,
  message
) => {
  try {
    await postQuery({
      url: apiUrls.addUserActivity,
      postData: {
        user_id: userId,
        activity_identifier: actionType,
        activity_value: message,
      },
      onSuccess: (res) => {
        console.log("Activity logged successfully:", res);
      },
      onFail: (error) => {
        console.error("Failed to log activity:", error);
      },
    });
  } catch (error) {
    console.error(
      "An unexpected error occurred while logging activity:",
      error
    );
  }
};
