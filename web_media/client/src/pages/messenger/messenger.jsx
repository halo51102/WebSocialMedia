import { useState, useContext, useRef, useEffect } from "react"
import "./messenger.css"
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";
import Topbar from "../../components/topbar/Topbar";
// import Message from "../../components/message/Message";
import Message from "../../components/messsagev2/Message";
import Conversation from "../../components/conversations/Conversation";
// import TestMessage from "../../components/testMessage/TestMessage";
import GroupByMessages from "../../components/groupMessage/GroupMessage";
import { io } from "socket.io-client";
import Navbar from "../../components/navbar/Navbar";

export default function Messenger({ socket }) {
  console.log("SOCKET: " + socket)
    const { currentUser } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [newConversation, setNewConversation] = useState(null);
    const [currentChat, setCurrentChat] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    // const socket = useRef();
    const scrollRef = useRef();
    const [file, setFile] = useState(null);
    const fileRef = useRef();
    const [selectedEmotion, setSelectedEmotion] = useState(null);

  const handleTextAreaOnChange = (e) => {
    setNewMessage(e.target.value)
    const textarea = e.target
    
    if (e.target.value.length === 0) {
      textarea.style.height = '20px'; 
    } else if (e.target.value.length > 70) {
      textarea.style.height = '10px'; 
      textarea.style.height = `${textarea.scrollHeight - 20}px`;
    }
    // textarea.style.maxHeight = `${textarea.scrollHeight}px`;
  }
    const getConversations = async () => {
        try {
            const res = await makeRequest.get("/conversations/" + currentUser.id);
            setConversations(res.data);
        } catch (err) {
          console.log(err);
        }
    };

    const handleEmotionSelect = async (e, index) => {
      // setSelectedEmotion(emotion); 
      // Do something with the selected emotion (e.g., send it, update state, etc.)
      console.log('Selected Emotion:', e.target.src);
      console.log('Selected Index:', index);
      console.dir(messages[index]) 
      let src = e.target.src;
      const m = messages[index]
      try {
        if (m.reactions) {
          let isUpdate = false
          m.reactions.forEach(async (r, j) => {
            if (r.userId === currentUser.id) {
              const res = await makeRequest.post(`/messages/${m.id}`, { "reactionId": r.reactionId, "reaction": src });      
              messages[index].reactions[j].reaction = src
              setMessages([...messages]);
              isUpdate = true
            }
          });
          if (!isUpdate) {
            const res = await makeRequest.post(`/messages/${m.id}`, { "messageId": m.id, "userId": currentUser.id, "reaction": src });      
            messages[index].reactions.push(res.data)
            setMessages([...messages]);
          }
        } else {
          const res = await makeRequest.post(`/messages/${m.id}`, { "messageId": m.id, "userId": currentUser.id, "reaction": src });      
          messages[index].reactions = [res.data]
          console.dir(messages)
          setMessages([...messages]);
        }
        // const res = await axios.post(`/messages/${m._id}`, {"emote": emotion});
        console.log("in handleEmotionSelect")
        // messages[index] = res.data
        // setMessages([...messages]);
      } catch (err) {
        console.log(err);
      }
    };

    useEffect(() => {
        // socket.current = io("ws://localhost:8900");
        socket?.on("getMessage", (data) => {
          setArrivalMessage({
            senderId: data.senderId,
            text: data.text,
            type: data.type,
            title: data.title,
            file_url: data.file_url,
            createdAt: Date.now(),
          });
        });
    }, []);

    useEffect(() => {
        arrivalMessage &&
          currentChat?.members.includes(arrivalMessage.senderId) &&
          setMessages((prev) => [...prev, arrivalMessage]);
    }, [arrivalMessage, currentChat]);

    useEffect(() => {
        socket?.emit("addUser", currentUser.id);
        // socket.current.on("getUsers", (users) => {
        //   setOnlineUsers(
        //     currentUser.followings.filter((f) => users.some((u) => u.userId === f))
        //   );
        // });
    }, [currentUser]);

    useEffect(() => {
        if (currentUser && currentUser.id)
            getConversations();
    }, [currentUser.id]);

    useEffect(() => {
        const getMessages = async () => {
          try {
            const res = await makeRequest.get("/messages/" + currentChat?.conversationId);
            setMessages(res.data);
          } catch (err) {
            console.log(err);
          }
        };
        if (currentChat?.conversationId) {
            getMessages();
        }
    }, [currentChat]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        let message = {
          senderId: currentUser.id,
          text: newMessage,
          conversationId: currentChat.conversationId,
          type: "text"
        };
        if (file !== null) {
          console.log("file: " + file)
          console.dir(file)
          if (file["type"].includes("image")) {
            message["type"] = "image"
          } else if (file["type"].includes("audio")) {
            message["type"] = "audio"
          } else if (file["type"].includes("video")) {
            message["type"] = "video"
          }
        }
    
        if (newMessage.includes("https://")) {
          message["type"] = "video_link"
          setMessages([...messages, message]);
        }
    
        const receiverId = currentChat.members.find(
          (member) => member !== currentUser.id
        );
        await socket?.emit("sendMessage", {
          senderId: currentUser.id,
          receiverId,
          text: newMessage,
          type: message["type"],
          file: file ? file : null,
          fileName: file ? file["name"] : null,
          mimeType: file ? file["type"] : null
        });
        if (message["type"] !== "text") {
          // Listen for the "getMetadata" event from the server
          const metadataPromise = new Promise((resolve) => {
            socket?.on("getMetadata", (data) => {
              console.log("Received metadata:", data);
              message["title"] = data.title;
              message["file_url"] = data.file_url;
              console.log("METADATA 2: " + message.file_url);
              resolve(); // Resolve the promise when metadata is received
            });
          });
    
          // Wait for the "getMetadata" event before sending the "post /messages" request
          await metadataPromise;
        }
        
        try {
            const res = await makeRequest.post("/messages", message);
            console.log(res.data)
            res.data.file_url = message?.file_url
            res.data.title = message?.title
            setMessages([...messages, res.data]);
            setNewMessage("");
            if (file) {
                setFile(null)
                fileRef.current.value = null;
            }
        } catch (err) {
          console.log(err);
        }
    };
    useEffect(() => {
        if (newConversation) {
          getConversations(); // Fetch conversations when the component mounts or whenever needed
        }
    }, [newConversation]);
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFile(file);
        console.log(file);
    };

    return (
      <>
            <Topbar />
            {/* <div style={{ display: "flex" }}>
                <div className="messenger">
                    hello
                </div>
            <span>{id}</span>
            </div> */}
            <div className="messenger">
                <dir className="chatMenu">
                    <dir className="chatMenuWrapper">
                    {conversations.map((c) => (
                    <div onClick={() => setCurrentChat(c)}>
                        <Conversation conversation={c} currentUser={currentUser} />
                    </div>
                    ))}
                    </dir>
                </dir>
                <div className="chatBox">
                    <div className="chatBoxWrapper">
                        {currentChat ? (
                            <>
                                <div className="chatBoxTop">
                                {/* <div className="message">
                                  {messages.map((m, index) => (
                                          <div  className={m.senderId === currentUser.id ? "message-group-sent" : "message-group-received"} ref={scrollRef}>
                                            <Message message={m} own={m.senderId === currentUser.id} testManual={false}/>
                                          </div>
                                      ))
                                  }
                                </div> */}
                                <div className="message">
                                  <GroupByMessages messages={messages} currentUser={currentUser} handleEmotionSelect={handleEmotionSelect} />
                                </div>
                                {/* <div className="messageContainer" ref={scrollRef}>
                                  <Message testManual={null}/>
                                </div> */}
                                </div>
                                
                                <div className="chatBoxBottom">
                                <input type="file" onChange={handleFileChange} ref={fileRef}/>
                                  {/* <div className="inputFile">
                                    
                                    <svg class="x1lliihq x1rdy4ex xcud41i x4vbgl9 x139jcc6 xsrhx6k" height="28px" viewBox="0 0 36 36" width="28px"><path d="M13.5 16.5a2 2 0 100-4 2 2 0 000 4z" fill="#035bb9"></path><path clip-rule="evenodd" d="M7 12v12a4 4 0 004 4h14a4 4 0 004-4V12a4 4 0 00-4-4H11a4 4 0 00-4 4zm18-1.5H11A1.5 1.5 0 009.5 12v9.546a.25.25 0 00.375.217L15 18.803a6 6 0 016 0l5.125 2.96a.25.25 0 00.375-.217V12a1.5 1.5 0 00-1.5-1.5z" fill="#035bb9" fill-rule="evenodd"></path></svg>
                                  </div> */}
                                  <textarea
                                      className="chatMessageInput"
                                      placeholder="write something..."
                                      onChange={(e) => handleTextAreaOnChange(e)}
                                      value={newMessage}
                                  ></textarea>
                                  {/* <button className="chatSubmitButton" onClick={handleSubmit}>
                                      Send
                                    </button> */}
                                  <div className="chatSubmitButtonIcon" onClick={handleSubmit}>
                                    <svg class="xsrhx6k" height="20px" viewBox="0 0 24 24" width="20px"><title>Nhấn Enter để gửi</title><path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 C22.8132856,11.0605983 22.3423792,10.4322088 21.714504,10.118014 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.8376543,3.0486314 1.15159189,3.99121575 L3.03521743,10.4322088 C3.03521743,10.5893061 3.34915502,10.7464035 3.50612381,10.7464035 L16.6915026,11.5318905 C16.6915026,11.5318905 17.1624089,11.5318905 17.1624089,12.0031827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" fill="#035bb9"></path></svg>
                                  </div>
                                </div>
                            </>
                        ) : (
                            <span className="noConversationText">
                              Open a conversation to start a chat.
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </>
        // <TestMessage />
    )
}