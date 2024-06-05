import { useContext, useState, useRef, useEffect, useCallback } from "react";
import { makeRequest } from "../../axios";
import "./callMess.scss";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { NotificationContext } from "../../context/notificationContext";
import Peer from 'simple-peer';
import { io } from "socket.io-client";
import { AuthContext } from "../../context/authContext";

const CallMess = ({ setOpenCall, room, socket }) => {

    const { currentUser } = useContext(AuthContext);
    console.log(room)
    console.log(currentUser)

    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState('');

    const [users, setUsers] = useState({});
    const [rooms, setRooms] = useState([]);
    const [roomId, setRoomId] = useState('');
    const [roomUsers, setRoomUsers] = useState([]);
    const [stream, setStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState('');
    const [callerSignal, setCallerSignal] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [usersInCall, setUsersInCall] = useState([]);
    const userAudio = useRef();
    const connectionRef = useRef({});


    const userInRoom = useCallback((roomId) => {
        if (roomId.trim !== '') {
            console.log("vào 73")
            socket.emit('alluser-in-room', roomId);
        }
    }, []);

    const callMessenger = (roomId) => {

        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
        });

        // Lắng nghe sự kiện 'signal' từ Peer
        peer.on('signal', (data) => {
            // Gửi tín hiệu gọi đến người dùng khác trong phòng
            console.log("tới emit call group")
            socket.emit('call-group', { signalData: data, roomId, from: currentUser.id });
            console.log("Đã phát call group")
        });

        // Lắng nghe sự kiện 'stream' từ Peer
        peer.on('stream', (stream) => {
            // Xử lý stream âm thanh từ người dùng khác và hiển thị nó
            userAudio.current.srcObject = stream;
        });
        socket.on('call-accepted', (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });
        // Lưu kết nối Peer vào danh sách kết nối (nếu cần)
        connectionRef.current[currentUser.id] = peer;
        //setUsersInCall(prevUsers => [...prevUsers, currentUser.id]);
    }

    //room: converId, name, member[]
    useEffect(() => {


        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            setStream(stream);
        });

        //lấy danh sách user có trong room
        if (room.conversationId && currentUser.id) userInRoom(room.conversationId);


        socket.on('update-users', (users) => {
            setUsers(users);
        });

        socket.on('user-in-room', (roomUsers) => {
            console.log("Đã set roomUser bằng sk.on user-in-room")
            setRoomUsers(roomUsers);
            console.log(roomUsers)
        });

        //thực hiện thao tác callmess tới tất cả user trong phòng

        socket.on('group-call-made', ({ signal, from }) => {
            console.log(from)
            alert("Cuộc gọi nhóm từ người dùng " + from);

            if (from !== currentUser.id) {

                if (!connectionRef.current[from]) {
                    connectionRef.current[from] = new Peer({
                        initiator: false,
                        trickle: false,
                        stream: stream,
                    });



                    connectionRef.current[from].on('signal', (data) => {
                        socket.emit('call-accepted', { signal: data, to: from });
                    });

                    connectionRef.current[from].on('stream', (stream) => {
                        if (userAudio.current) {
                            userAudio.current.srcObject = stream;
                        }
                    });

                }

                connectionRef.current[from].signal(signal);
                setReceivingCall(true);
                setCaller(from);
                setCallerSignal(signal);
            }
        });
        socket.on('call-accepted', ({ signal }) => {
            const peer = connectionRef.current[caller];
            if (peer) {
                peer.signal(signal);
            }
        });
        socket.on('user-disconnected', (userId) => {
            if (connectionRef.current[userId]) {
                connectionRef.current[userId].destroy();
                delete connectionRef.current[userId];
            }
            /*setUsersInCall(prevUsers => prevUsers.filter(id => id !== userId));
            if (usersInCall.length === 1 && usersInCall[0] === currentUser.id) {
                endCall();
            }*/
        });
        socket.on('call-ended', ({ userId }) => {
            if (connectionRef.current[userId]) {
                connectionRef.current[userId].destroy();
                delete connectionRef.current[userId];
            }
            /*setUsersInCall(prevUsers => prevUsers.filter(id => id !== userId));
            if (usersInCall.length === 1 && usersInCall[0] === currentUser.id) {
                endCall();
            }*/
        });
        return () => {
            socket.off('update-users');
            socket.off('user-in-room');
            socket.off('group-call-made');
            socket.off('call-accepted');
            socket.off('user-disconnected');
            socket.off('call-ended');
        };
    }, [receivingCall, callAccepted]);

    /*useEffect(() => {
        if (usersInCall.length === 1 && usersInCall[0] === currentUser.id) {
            endCall();
        }
    }, [usersInCall, currentUser.id]);*/

    const addUserToCall = (userId) => {
        if(!(usersInCall.some(id => id === caller))){
            setUsersInCall(prevUsers => [...prevUsers, caller]);
        }
        setUsersInCall(prevUsers => [...prevUsers, userId]);
    };

    const acceptCall = () => {
        //addUserToCall(userId); 
        setCallAccepted(true);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
        });

        peer.on('signal', (data) => {
            socket.emit('answer-call', { signal: data, to: caller });
        });

        peer.on('stream', (stream) => {
            userAudio.current.srcObject = stream;
        });

        connectionRef.current = peer;

        peer.signal(callerSignal);
    };

    const endCall = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        socket.emit('end-call', { roomId: room.conversationId, userId: currentUser.id });
        Object.values(connectionRef.current).forEach(peer => {
            if (peer && typeof peer.destroy === 'function') {
                peer.destroy();
            } else {
                console.error("peer is not an instance of Peer", peer);
            }
        });
        connectionRef.current = {};
        setReceivingCall(false);
        setCaller('');
        setCallerSignal(null);
        setCallAccepted(false);
        setOpenCall(false);
    }, [receivingCall]);


    return (
        <div className="update">
            <div className="wrapper">
                <label>Call</label>

                {callAccepted ? <div>
                    <button>Share</button>
                    <button>Member</button>
                    <button>Camera</button>
                    <button>Micro</button>
                    <button className="close" onClick={endCall}>
                        End Call
                    </button>
                    <audio playsInline ref={userAudio} autoPlay />
                </div> : <button onClick={() => callMessenger(room.conversationId)}>Call Messenger</button>}

                {receivingCall && !callAccepted && (
                    <div>
                        <h1>{caller} đang gọi...</h1>
                        <button onClick={acceptCall}>Trả lời</button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default CallMess;