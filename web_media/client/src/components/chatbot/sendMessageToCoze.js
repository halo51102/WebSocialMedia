import axios from "axios";

const URL = "https://api.coze.com/open_api/v2/chat";
const API_KEY =
  "pat_Wbuy4JQXHNSRVdqfIom6tYe63VYFCL8RuLLFs7pZ1DI7IqTatLrr8DbfBGB3cFbb";
const BOT_ID = "7392269590124199953";

export const sendMessageToCoze = async (messsage) => {
  try {
    const response = await axios.post(
      URL,
      {
        bot_id: BOT_ID,
        user: "7392269950737973255",
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
