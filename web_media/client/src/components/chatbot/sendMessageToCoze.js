import axios from "axios";

const URL = "https://api.coze.com/open_api/v2/chat";
const API_KEY =
  "pat_fvCeRT55UY8Gjt3dbBkJLfMhcEkauDemhF6qFkQMY9LdfzRmy9EKK2TjP0bbfq0o";
const BOT_ID = "7389157184371884039";

export const sendMessageToCoze = async (messsage) => {
  try {
    const response = await axios.post(
      URL,
      {
        bot_id: BOT_ID,
        user: "7389156454517276689",
        query: messsage,
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    return response.data;
  } catch (error) {}
};
