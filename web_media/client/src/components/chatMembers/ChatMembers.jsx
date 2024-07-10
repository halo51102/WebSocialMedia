import { IoIosCloseCircle } from "react-icons/io";
import { makeRequest } from "../../axios";
import { useEffect, useState } from "react";
import profileAlt from "../../assets/profileAlt.png";

const ChatMembers = ({ currentChat, handleClose }) => {
    useEffect(() => {
        const getChatMembers = async () => {
            const res = await makeRequest.get("/conversations/members/" + currentChat.conversationId);
            setChatMembers(res.data);
        };

        try {
            getChatMembers();
        }
        catch (err) {
            setError(true);
        }
    }, []);

    const [chatMembers, setChatMembers] = useState([]);
    const [error, setError] = useState(false);

    console.log(chatMembers)
    console.log(currentChat)
    return (
        <div className="chat-members">
            <div className="wrapper">
                <div className="head">
                    <p>Thành viên đoạn chat</p>
                    <IoIosCloseCircle style={{ fontSize: '30px', cursor: 'pointer' }} onClick={handleClose} />
                </div>
                <div className="body">
                    {
                        error
                            ? <p>Lỗi load dữ liệu</p>
                            : chatMembers.map((member) => (
                                <div className="conversation">
                                    <div className="info">
                                        <img className="conversationImg" src={member?.profilePic ? member.profilePic : profileAlt} alt="" />
                                    </div>
                                    <span className="conversationName">{member.name}</span>
                                </div>
                            ))
                    }
                </div>
            </div>
        </div>
    )

};
export default ChatMembers;