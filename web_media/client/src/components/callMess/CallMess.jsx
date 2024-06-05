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
    }

    //room: converId, name, member[]
    useEffect(() => {


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

                let peer = connectionRef.current[from];
                if (!peer) {
                    peer = new Peer({
                        initiator: false,
                        trickle: false,
                        stream: stream,
                    });

                    connectionRef.current[from] = peer;

                    peer.on('signal', (data) => {
                        socket.emit('call-accepted', { signal: data, to: from });
                    });

                    peer.on('stream', (stream) => {
                        if (userAudio.current) {
                            userAudio.current.srcObject = stream;
                        }
                    });

                }

                peer.signal(signal);
                setReceivingCall(true);
                setCaller(from);
                setCallerSignal(signal);
            }
        });

        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            setStream(stream);
        });

        return () => {
            socket.off('update-users');
            socket.off('user-in-room');
            socket.off('group-call-made');
        };
    }, []);

    const acceptCall = () => {
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

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };
    return (
        <div className="update">
            <div className="wrapper">
                <label>Call</label>

                {callAccepted ? <div>
                    <button>Share</button>
                    <button>Member</button>
                    <button>Camera</button>
                    <button>Micro</button>
                    <button className="close" onClick={() => setOpenCall(false)}>
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