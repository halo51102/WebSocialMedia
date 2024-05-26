import axios from "axios";
import { useEffect, useState } from "react";
import "./conversation.css";
import { makeRequest } from "../../axios";


export default function Conversation({ conversation, currentUser }) {
  const [user, setUser] = useState(null);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  useEffect(() => {
    const friendId = conversation.members.find((m) => m !== currentUser.id);
    console.log(friendId)
    const getUser = async () => {
      try {
        const res = await makeRequest.get("/users/find/" + friendId);
        setUser(res.data);
        console.dir(res.data)
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, [currentUser, conversation]);

  return (
    <div className="conversation">
      <img
        className="conversationImg"
        src={user?.profilePic}
        alt=""
      />
      <span className="conversationName">{conversation?.name ? conversation.name : user?.name}</span>
    </div>
  );
}
