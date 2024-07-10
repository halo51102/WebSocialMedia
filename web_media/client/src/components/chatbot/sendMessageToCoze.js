import axios from "axios";

const URL = "https://api.coze.com/open_api/v2/chat";
const API_KEY =
  "pat_h8qwyd84NUrvDKJDuX8xDVlPpnLfozbQaMHnJBYxEGeHM1jGa64Hydtv9i5NQRW2";
const BOT_ID = "7388788277077229569";

export const sendMessageToCoze = async (messsage) => {
  try {
    const response = await axios.post(
      URL,
      {
        bot_id: BOT_ID,
        user: "7388785721232375809",
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
