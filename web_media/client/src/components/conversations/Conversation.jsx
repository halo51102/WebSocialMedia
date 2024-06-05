import axios from "axios";
import { useEffect, useState } from "react";
import "./conversation.css";
import { makeRequest } from "../../axios";
import profileAlt from "../../assets/profileAlt.png"


export default function Conversation({ conversation, currentUser }) {
  const [users, setUsers] = useState([]);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  useEffect(() => {
    const friendId = conversation.members.filter((m) => m !== currentUser.id);
    const getUser = async () => {
      try {
        friendId.map(async (item) => {
          const res = await makeRequest.get("/users/find/" + item);
          setUsers((prev) => [...prev, res.data]);
        })
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
    console.log(users)
  }, [currentUser, conversation]);

  return (
    <div className="conversation">
      {conversation?.name
        ? <div className="conversationImg groupConversationImgs">
          <img
            className="conversationImg groupConversationImg1"
            src={users[0]?.profilePic ? users[0].profilePic : profileAlt}
            alt=""
          />
          <img
            className="conversationImg groupConversationImg2"
            src={users[1]?.profilePic ? users[1].profilePic : profileAlt}
            alt=""
          />
        </div>
        :
        <img
          className="conversationImg"
          src={users[0]?.profilePic ? users[0].profilePic : profileAlt}
          alt=""
        />
      }
      <span className="conversationName">{conversation?.name ? conversation.name : users[0]?.name ? users[0].name : "Người dùng SocialMedia"}</span>
    </div>
  );
}
