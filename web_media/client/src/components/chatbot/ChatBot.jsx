import React, { useState } from 'react';
import './Chatbot.scss'; // Import CSS để tùy chỉnh giao diện
import { sendMessageToCoze } from './sendMessageToCoze';
import profileAlt from "../../assets/profileAlt.png"

import { Link } from "react-router-dom";
const ChatBot = ({ setOpenChat }) => {
  const [messages, setMessages] = useState([]); // Danh sách tin nhắn
  const [message, setMessage] = useState('')
  const msg = {
    type: null,
    profilePic: null,
    name: null,
    text: null,
    link: null,
    city: null,
    fromUser: false
  };
  const [mess, setMess] = useState(msg)

  // Hàm xử lý khi người dùng gửi tin nhắn
  const handleSendMessage = async (messageText) => {
    // Tạo tin nhắn mới từ người dùng
    const newMessage = {
      text: messageText,
      fromUser: true
    };

    // Thêm tin nhắn mới vào danh sách
    setMessages((prev) => [...prev, newMessage]);
    await sendCoze(messageText);
    setMessage("")

  };
  const handleChange = (e) => {
    setMessage(e.target.value)
  }
  function isJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
  const sendCoze = (message) => {
    sendMessageToCoze(message)
      .then((data) => {
        console.log(data)
        data.messages.map((message) => {
          if (message.type === "answer") {

            try {
              const dataArray = message.content.split('\n');
              const jsonData = dataArray.map(item => JSON.parse(item));
              jsonData.forEach(json => {
                const newMessage = {
                  type: "answer",
                  profilePic: json.profilePic,
                  name: json.name,
                  text: null,
                  link: json.link,
                  city: json.city,
                  fromUser: false,
                  favourite:json.favourite,
                  school: json.school,
                  career: json.career,
                  talent: json.talent,
                  website: json.website
                };
                console.log(data)
                setMessages((prev) => [...prev, newMessage]);
              });

            }
            catch {
              const newMessage = {
                type: "unknown",
                text: message.content,
                fromUser: false
              };
              console.log(data)
              setMessages((prev) => [...prev, newMessage]);
            }
          } else if (message.type === "follow_up") {
            const newMessage = {
              type: "follow_up",
              text: message.content,
              fromUser: false
            };
            console.log(data)
            setMessages((prev) => [...prev, newMessage]);
          }
        })

      })
      .catch((error) => {

        const newMessage = {
          type: "error",
          text: "Không nhận diện được yêu cầu",
          fromUser: false
        };
        setMessages((prev) => [...prev, newMessage])
      });
  }
  console.log(messages)
  return (
    <div className="chatbot-container">
      <button className="exitChatBot" onClick={() => setOpenChat(false)}>x</button>
      <div className="titleChatBot"> ChatBot
      </div>
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index}>
            {message.fromUser &&
              <div className={message.fromUser ? 'message user-message' : 'message bot-message'}>
                {message.text}
              </div>}
            {(!message.fromUser) && (message.type === "follow_up") && <div>
              <div className={message.fromUser ? 'message user-message' : 'message bot-message'} onClick={() => handleSendMessage(message.text)}>
                {message.text}
              </div>
            </div>}
            {(!message.fromUser) && (message.type === "error") &&
              <div className={message.fromUser ? 'message user-message' : 'message bot-message'}>
                {message.text}
              </div>}
            {(!message.fromUser) && (message.type === "unknown") &&
              <div className={message.fromUser ? 'message user-message' : 'message bot-message'}>
                {message.text}
              </div>}
            {(!message.fromUser) && (message.type === "answer") && <div className='link'>
              <Link to={message.link} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="userInfoFind">
                  <img src={message.profilePic ? message.profilePic : profileAlt} alt="" />
                  <div className="details">
                    <div
                    >
                      <div style={{ display: "flex", flexDirection: 'column' }}>

                        <span className="name">{message.name}</span>
                        <span style={{ fontSize: '12px', color: 'black', fontWeight: 100 }}>
                          {message.favourite}</span>
                      </div>

                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', color: 'black', fontWeight: 100 }}>{message.school}</span>
                  <span style={{ fontSize: '12px', color: 'black', fontWeight: 100 }}>{message.city}</span>
                  <span style={{ fontSize: '12px', color: 'black', fontWeight: 100 }}>{message.website}</span>
                </div>
              </Link>
            </div>}
          </div>
        ))
        }
      </div >
      <div className="chatbot-input">
        <textarea value={message} type="text" onChange={handleChange} placeholder="Nhập tin nhắn..." style={{ width: '100%' }} />
        <button onClick={() => handleSendMessage(message)}>Gửi</button>
      </div>
    </div >
  );
};

export default ChatBot;
