import { useState, useContext, useRef, useEffect } from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import "./messenger.scss"
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";
import Topbar from "../../components/topbar/Topbar";
// import Message from "../../components/message/Message";
import Message from "../../components/messsagev2/Message";
import Conversation from "../../components/conversations/Conversation";
// import TestMessage from "../../components/testMessage/TestMessage";
import GroupByMessages from "../../components/groupMessage/GroupMessage";
import CallMess from "../../components/callMess/CallMess"
import CreateStory from "../../components/createStory/CreateStory"
import MembersGroup from "../../components/membersGroup/MembersGroup"
import CreateConversationForm from "../../components/createConversationForm/CreateConversationForm";
import { io } from "socket.io-client";
import Navbar from "../../components/navbar/Navbar";
import { SlOptionsVertical } from "react-icons/sl";
import { fabClasses } from "@mui/material";
import { FaImage } from "react-icons/fa6";
import { IoCloseCircle } from "react-icons/io5";
import { uploadImagesToS3 } from "../../s3.config";
import profileAlt from "../../assets/profileAlt.png"
import { MdDeleteForever } from "react-icons/md";
import { FaPencil } from "react-icons/fa6";
import { CiSearch } from "react-icons/ci";
import { IoIosArrowRoundBack, IoIosPeople } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatMembers from "../../components/chatMembers/ChatMembers";
import { MdOutlineGroupOff } from "react-icons/md";

import CallWindow from '../callWindow/CallWindow';

export default function Messenger({ socket }) {
  const { currentUser } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [newConversation, setNewConversation] = useState(null);
  const [isOpenChangeConversationNameForm, setIsOpenChangeConversationNameForm] = useState(false);
  const [currentChat, setCurrentChat] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isOpenConversationOption, setIsOpenConversationOption] = useState(false)
  const [isOpenCurrentChatOption, setIsOpenCurrentChatOption] = useState(false)
  const [isOpenFormDeleteConversation, setIsOpenFormDeleteConversation] = useState(false)
  const [isOpenSearchConversation, setIsOpenSearchConversation] = useState(false);
  const [openChatMembers, setOpenChatMembers] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  // const socket = useRef();
  const scrollRef = useRef();
  // const [file, setFile] = useState([]);
  const [files, setFiles] = useState([]);
  const fileRef = useRef();
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const navigate = useNavigate();

  const [openCall, setOpenCall] = useState(false);

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
      console.log(res.data)
      setConversations(res.data);
      return res;
    } catch (err) {
      console.log(err);
    }
  };

  const handleEmotionSelect = async (e, index) => {
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
      console.log("in handleEmotionSelect")
    } catch (err) {
      console.log(err);
    }
  };

  const videoRef = useRef(null);

  // useEffect(() => {
  //   for (var file in files) {
  //     if (file["type"].includes("video")) {
  //       const url = URL.createObjectURL(file);
  //       videoRef.current.src = url;
  //     }
  //   }
  // }, [files]);

  useEffect(() => {
    socket?.on("getMessage", (data) => {
      setArrivalMessage({
        id: data.messageId,
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
    setUsers([]);
    if (currentChat) {
      const friendId = currentChat.members.filter((m) => m !== currentUser.id);
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
    }
  }, [currentUser, currentChat]);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.senderId) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    socket?.emit("addUser", currentUser.id);
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
    console.log("In handle submit")
    e.preventDefault();

    if (files.length !== 0) {       //Gửi tin nhắn có file đính kèm
      files.map(async (file) => {
        let message = {
          senderId: currentUser.id,
          text: newMessage,
          conversationId: currentChat.conversationId,
          type: "text"
        };

        if (file !== null) {
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

        console.log("message trước khi gửi metadata:", message)

        const receiverId = currentChat.members.find(
          (member) => member !== currentUser.id
        );

        // await socket?.emit("sendMetadata", {
        //   senderId: currentUser.id,
        //   receiverId,
        //   text: newMessage,
        //   type: message["type"],
        //   file: file ? file : null,
        //   fileName: file ? file["name"] : null,
        //   mimeType: file ? file["type"] : null
        // });

        const uploadData = await uploadImagesToS3(file);


        console.log("đã up metadata")
        message["file_url"] = uploadData;
        console.log("message sau khi get metadata:", message)

        try {
          const res = await makeRequest.post("/messages", message);
          console.log("response post message: " + res.data)
          await socket?.emit("sendMessage", {
            messageId: res.data.id,
            senderId: currentUser.id,
            receiverId,
            text: newMessage,
            type: message["type"],
            file: file ? file : null,
            fileName: file ? file["name"] : null,
            mimeType: file ? file["type"] : null,
            title: message["title"],
            file_url: message["file_url"],
          });


          res.data.file_url = message?.file_url
          res.data.title = message?.title
          setMessages([...messages, res.data]);
          setNewMessage("");
        } catch (err) {
          console.log(err);
        }
      })
      setFiles([]);
    }
    else {
      if (newMessage != '') {    //Gửi tin nhắn text không có file đính kèm
        let message = {
          senderId: currentUser.id,
          text: newMessage,
          conversationId: currentChat.conversationId,
          type: "text"
        };

        if (newMessage.includes("https://")) {
          message["type"] = "video_link"
          setMessages([...messages, message]);
        }
        await console.log(message)
        const receiverId = currentChat.members.find(
          (member) => member !== currentUser.id
        );

        await socket?.emit("sendMetadata", {
          senderId: currentUser.id,
          receiverId,
          text: newMessage,
          type: message["type"],
          file: null,
          fileName: null,
          mimeType: null
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
          axios.defaults.headers.common['Content-Type'] = 'application/json';
          axios.defaults.headers.common['Accept'] = 'application/json';

          const formData = new FormData();
          formData.append('text', newMessage);
          const prediction = await axios.post("http://127.0.0.1:8001/", formData);
          const result = prediction.data.result;
          if (result != '0') {
            message["text"] = "WebSocialMedia đã che tin nhắn vì ngôn từ phản cảm..."
          }

          const res = await makeRequest.post("/messages", message);
          console.log(res.data)
          await socket?.emit("sendMessage", {
            messageId: res.data.id,
            senderId: currentUser.id,
            receiverId,
            text: newMessage,
            type: message["type"],
            file: null,
            fileName: null,
            mimeType: null,
            title: message["title"],
            file_url: message["file_url"],
          });


          res.data.file_url = message?.file_url
          res.data.title = message?.title
          setMessages([...messages, res.data]);
          setNewMessage("");
        } catch (err) {
          console.log(err);
        }
      }
    }
  };

  useEffect(() => {
    if (newConversation) {
      getConversations(); // Fetch conversations when the component mounts or whenever needed
    }
  }, [newConversation]);

  useEffect(() => {
    getConversations();
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   setFile(file);
  //   console.log(file);
  // };

  const handleClickConversationOption = (chat) => {
    if (selectedChat == chat && isOpenConversationOption) {
      setIsOpenConversationOption(false);
    }
    else {
      setIsOpenConversationOption(true);
    }
    setIsOpenCurrentChatOption(false);
  }

  const handleDeleteConversation = async () => {
    try {
      console.log(selectedChat.conversationId)
      const r = await makeRequest.delete("/conversations/" + selectedChat.conversationId);
      setIsOpenFormDeleteConversation(false);
      setIsOpenCurrentChatOption(false);
      setCurrentChat(null);
      setSelectedChat(null);
      const res = await getConversations();
      console.log(res.data)
    }
    catch (err) {
      alert(err);
    }
  }
  
  const handleCall = () => {
    console.log(socket?.id)
    alert('Đang làm!');
    const callWindow = window.open(`/call?roomId=${currentChat.conversationId}&isRc=false`, 'Call Window', 'width=900,height=600');
  }
  const handleClickCurrentChatOption = () => {
    setIsOpenCurrentChatOption(!isOpenCurrentChatOption);
    setIsOpenConversationOption(false);
    setSelectedChat(currentChat);
  }

  // Search users
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
    if (e.target.value !== '') {
      const results = conversations.filter(conversation =>
        conversation?.name?.toLowerCase().includes(e.target.value.trim())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }

  const handleOpenChatMembers = () => {
    setOpenChatMembers(true);
    setIsOpenCurrentChatOption(false);
  }

  const handleOpenOutGroupForm = () => {
    makeRequest.delete("/conversations/" + currentChat.conversationId + "/" + currentUser.id);
    setMessages(messages.filter(message => message.conversationId !== currentChat.conversationId));
    setCurrentChat(messages[0]);
  }

  return (
    <div >
      <Topbar />

      <div className="messenger" >
        <dir className="chatMenu">
          <dir className="chatMenuWrapper">
            <h2 style={{ paddingLeft: '10px', color: 'black', margin: '10px 0' }}>Tin nhắn</h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between', paddingLeft: '10px' }}>
              {
                isOpenSearchConversation
                &&
                <div className="icon-back"
                  onClick={() => {
                    setIsOpenSearchConversation(false);
                    setSearchInput('');
                  }}>
                  <IoIosArrowRoundBack />
                </div>
              }
              <div className="search-conversation">
                <div className="icon-search">
                  <CiSearch />
                </div>
                <input
                  type="text"
                  value={searchInput}
                  placeholder="Nhập từ khóa..."
                  onClick={() => { setIsOpenSearchConversation(true) }}
                  onChange={handleSearch}
                  style={{ border: 'none', marginTop: '0' }} />
              </div>
              <div onClick={() => {
                setIsOpenConversationOption(false);
                setIsOpenCurrentChatOption(false);
              }}>
                <CreateConversationForm setNewConversation={setNewConversation} />
              </div>
            </div>
            {/* <input placeholder="Search for friends" className="chatMenuInput" /> */}
            {
              !isOpenSearchConversation
                ? <div style={{ overflow: 'hidden auto', height: "80%" }}>
                  {
                    conversations.map((c) => (
                      <div className="conversation" tabIndex={0}>
                        <div onClick={() => {
                          setCurrentChat(c);
                          setIsOpenCurrentChatOption(false);
                          setIsOpenConversationOption(false);
                        }} >
                          <Conversation
                            onClick={() => {
                              setIsOpenSearchConversation(false);
                              setSearchInput('');
                            }}
                            conversation={c}
                            currentUser={currentUser} />
                        </div>
                        <SlOptionsVertical
                          className="button-option"
                          onClick={() => {
                            setSelectedChat(c);
                            handleClickConversationOption(c);
                          }} />
                        {
                          isOpenConversationOption
                          && selectedChat === c
                          && <SlOptionsVertical
                            className="button-option"
                            style={{ display: 'block' }}
                            onClick={() => {
                              setSelectedChat(c);
                              handleClickConversationOption(c);
                            }} />
                        }
                        {
                          isOpenConversationOption
                          && selectedChat === c
                          && <div className="conversation-option">
                            <span className="conversation-delete"
                              onClick={() => {
                                setIsOpenFormDeleteConversation(true);
                                setIsOpenConversationOption(false);
                              }}>
                              Xóa cuộc hội thoại
                            </span>
                          </div>
                        }
                      </div>
                    ))
                  }

                </div>
                : <div style={{ overflow: 'hidden auto', height: "80%" }}>
                  {
                    searchResults.length === 0 && searchInput !== '' && "Không tìm thấy kết quả phù hợp"
                  }
                  {
                    searchResults.map((c) => (
                      <div className="conversation" tabIndex={0}>
                        <div onClick={() => {
                          setCurrentChat(c);
                          setIsOpenCurrentChatOption(false);
                          setIsOpenConversationOption(false);
                        }} >
                          <Conversation
                            onClick={() => {
                              setIsOpenSearchConversation(false);
                              setSearchInput('');
                            }}
                            conversation={c}
                            currentUser={currentUser} />
                        </div>
                        <SlOptionsVertical
                          className="button-option"
                          onClick={() => {
                            setSelectedChat(c);
                            handleClickConversationOption(c);
                          }} />
                        {
                          isOpenConversationOption
                          && selectedChat === c
                          && <SlOptionsVertical
                            className="button-option"
                            style={{ display: 'block' }}
                            onClick={() => {
                              setSelectedChat(c);
                              handleClickConversationOption(c);
                            }} />
                        }
                        {
                          isOpenConversationOption
                          && selectedChat === c
                          && <div className="conversation-option">
                            <span className="conversation-delete"
                              onClick={() => {
                                setIsOpenFormDeleteConversation(true);
                                setIsOpenConversationOption(false);
                              }}>
                              Xóa cuộc hội thoại
                            </span>
                          </div>
                        }
                      </div>
                    ))
                  }

                </div>
            }
          </dir>

        </dir>
        {
          isOpenFormDeleteConversation
          && <div className="form-delete">
            <span>Xóa cuộc hội thoại {selectedChat?.name ? selectedChat.name : users[0].name} sẽ không thấy lịch sử tin nhắn nữa,
              bạn chắc chắn muốn xóa?</span>
            <div className="form-delete-button-group">
              <span className="form-delete-button form-delete-button-ok"
                onClick={handleDeleteConversation}>
                OK
              </span>
              <span className="form-delete-button"
                onClick={() => { setIsOpenFormDeleteConversation(false) }}>
                Hủy
              </span>
            </div>
          </div>
        }

        <div className="chatBox">
          <div className="chatBoxWrapper"
            onClick={() => {
              setIsOpenConversationOption(false);
            }}>
            {currentChat
              &&
              <div className="headerChat">
                <div className="info" onClick={() => {
                  if (users.length == 1)
                    navigate(`/profile/${users[0].id}`);
                  else
                    handleOpenChatMembers();
                }}>
                  {(currentChat.members.length > 2)
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
                  <span className="conversationName">{currentChat?.name ? currentChat.name : users[0]?.name ? users[0].name : "Người dùng SocialMedia"}</span>
                </div>
                <div className="extension">
                  <div className="icon">
                    <SlOptionsVertical
                      onClick={() => {
                        handleClickCurrentChatOption();
                      }} />
                  </div>
                </div>
                {isOpenCurrentChatOption
                  && <div className="current-chat-option-form">
                    <div className="current-chat-option">
                      <div className="icon">
                        <MdDeleteForever />
                      </div>
                      <span
                        onClick={() => {
                          setIsOpenFormDeleteConversation(true);
                        }}>
                        Xóa cuộc trò chuyện
                      </span>
                    </div>
                    {users.length === 1
                      ?
                      <div className="current-chat-option"
                        onClick={() => setIsOpenChangeConversationNameForm(true)}>
                        <div className="icon">
                          <FaPencil />
                        </div>
                        <span>Đổi biệt danh</span>
                        {
                          isOpenChangeConversationNameForm && ''
                        }
                      </div>
                      :
                      <div className="current-chat-option">
                        <div className="icon">
                          <FaPencil />
                        </div>
                        <span>Đổi tên nhóm</span>
                      </div>
                    }
                    {
                      users.length !== 1
                      && <div className="current-chat-option" onClick={handleOpenChatMembers}>
                        <div className="icon">
                          <IoIosPeople />
                        </div>
                        <span>Xem thành viên đoạn chat</span>
                      </div>
                    }
                    {
                      users.length !== 1
                      && <div className="current-chat-option" onClick={handleOpenOutGroupForm}>
                        <div className="icon">
                          <MdOutlineGroupOff />
                        </div>
                        <span>Rời nhóm</span>
                      </div>
                    }
                  </div>
                }
              </div>
            }
            {currentChat ? (
              <>
                <div className="chatBoxTop">
                  <div className="message">
                    <GroupByMessages messages={messages} currentUser={currentUser} handleEmotionSelect={handleEmotionSelect} socket={socket} />
                  </div>
                </div>

                <div>
                  <div
                    className='images'
                    style={{ display: 'flex', gap: '10px', alignItems: 'center', paddingLeft: '70px' }}
                  >
                    {files.length !== 0 && files.map((item) =>
                      <div style={{ position: 'relative', maxWidth: '100px' }}>
                        <IoCloseCircle
                          className="icon-remove"
                          style={{ position: 'absolute', right: 0, cursor: 'pointer', zIndex: 1000 }}
                          onClick={() => setFiles((prevFiles) => prevFiles.filter((file) => file !== item))} />
                        {item["type"].includes("image")
                          ? <img className="file"
                            alt=""
                            src={URL.createObjectURL(item)}
                            style={{ width: '70px' }} />
                          : item["type"].includes("video")
                            ? <video ref={videoRef}
                              width="70px"
                              height=""
                              controls>
                            </video>
                            : <img className="file"
                              alt=""
                              src="https://www.bing.com/th/id/OIP.X_-ZmMTV55izgF-6wZadWgHaHa?w=199&h=199&c=7&r=0&o=5&dpr=1.3&pid=1.7"
                              style={{ width: '70px' }} />}
                      </div>
                    )}
                  </div>

                  <div className="chatBoxBottom">
                    <input type="file"
                      id="file"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        setFiles((prevFiles) => [...prevFiles, ...Array.from(e.target.files)])
                      }}
                      multiple />
                    <label htmlFor="file" style={{ cursor: 'pointer' }}>
                      <FaImage className="" style={{ color: 'blue', padding: '10px' }} />
                    </label>
                    {/* <input type="file" onChange={handleFileChange} /> */}
                    <textarea
                      className="chatMessageInput"
                      placeholder="Nhập tin nhắn ..."
                      onChange={(e) => handleTextAreaOnChange(e)}
                      value={newMessage}
                    >
                    </textarea>
                    <div className="chatSubmitButtonIcon"
                      onClick={handleSubmit}>
                      <svg className="xsrhx6k"
                        height="20px"
                        viewBox="0 0 24 24"
                        width="20px">
                        <title>Nhấn Enter để gửi</title>
                        <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 C22.8132856,11.0605983 22.3423792,10.4322088 21.714504,10.118014 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.8376543,3.0486314 1.15159189,3.99121575 L3.03521743,10.4322088 C3.03521743,10.5893061 3.34915502,10.7464035 3.50612381,10.7464035 L16.6915026,11.5318905 C16.6915026,11.5318905 17.1624089,11.5318905 17.1624089,12.0031827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" fill="#035bb9"></path></svg>
                    </div>
                  </div>
                  <div className="chatSubmitButtonIcon" onClick={handleCall}>
                    <svg class="xsrhx6k" height="20px" viewBox="0 0 200 200" width="20px"><title>Nhấn để gọi</title><path fill="#010002" d="M198.048,160.105l-31.286-31.29c-6.231-6.206-16.552-6.016-23.001,0.433l-15.761,15.761
			c-0.995-0.551-2.026-1.124-3.11-1.732c-9.953-5.515-23.577-13.074-37.914-27.421C72.599,101.48,65.03,87.834,59.5,77.874
			c-0.587-1.056-1.145-2.072-1.696-3.038l10.579-10.565l5.2-5.207c6.46-6.46,6.639-16.778,0.419-23.001L42.715,4.769
			c-6.216-6.216-16.541-6.027-23.001,0.433l-8.818,8.868l0.243,0.24c-2.956,3.772-5.429,8.124-7.265,12.816
			c-1.696,4.466-2.752,8.729-3.235,12.998c-4.13,34.25,11.52,65.55,53.994,108.028c58.711,58.707,106.027,54.273,108.067,54.055
			c4.449-0.53,8.707-1.593,13.038-3.275c4.652-1.818,9.001-4.284,12.769-7.233l0.193,0.168l8.933-8.747
			C204.079,176.661,204.265,166.343,198.048,160.105z M190.683,176.164l-3.937,3.93l-1.568,1.507
			c-2.469,2.387-6.743,5.74-12.984,8.181c-3.543,1.364-7.036,2.24-10.59,2.663c-0.447,0.043-44.95,3.84-100.029-51.235
			C14.743,94.38,7.238,67.395,10.384,41.259c0.394-3.464,1.263-6.95,2.652-10.593c2.462-6.277,5.812-10.547,8.181-13.02l5.443-5.497
			c2.623-2.63,6.714-2.831,9.112-0.433l31.286,31.286c2.394,2.401,2.205,6.492-0.422,9.13L45.507,73.24l1.95,3.282
			c1.084,1.829,2.23,3.879,3.454,6.106c5.812,10.482,13.764,24.83,29.121,40.173c15.317,15.325,29.644,23.27,40.094,29.067
			c2.258,1.249,4.32,2.398,6.17,3.5l3.289,1.95l21.115-21.122c2.634-2.623,6.739-2.817,9.137-0.426l31.272,31.279
			C193.5,169.446,193.31,173.537,190.683,176.164z"></path></svg>
                  </div>
                </div>
              </>
            ) : (
              <span className="noConversationText" style={{ padding: '10px' }}>
                Mở một cuộc trò chuyện để bắt đầu nhắn tin.
              </span>
            )}
          </div>
        </div>
        {openCall && <CallMess setOpenCall={setOpenCall} room={currentChat} socket={socket} />}
      </div>
      {
        openChatMembers
        && <ChatMembers currentChat={currentChat} handleClose={() => setOpenChatMembers(false)} />
      }
    </div >
  )
}