import { useContext, useState, useRef, useEffect, useCallback } from "react";
import { makeRequest } from "../../axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { NotificationContext } from "../../context/notificationContext";
import Peer from 'simple-peer';
import { io } from "socket.io-client";
import { AuthContext } from "../../context/authContext";
import { initializeSocket } from "./initializeSocket";

const CallWindow = ({ socket, soketId, currentUser }) => {
    const [stream, setStream] = useState(null);
    const [caller, setCaller] = useState('');
    const [callerSignal, setCallerSignal] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [usersInCall, setUsersInCall] = useState([]);
    const userAudio = useRef();
    const connectionRef = useRef({});
    const isSignalListenerSetRef = useRef(false);
    const roomId = new URLSearchParams(window.location.search).get('roomId');
    const isRc = new URLSearchParams(window.location.search).get('isRc');
    const from = new URLSearchParams(window.location.search).get('from');

    useEffect(() => {
        console.log(currentUser.id)
        console.log(from)
        console.log(socket)

        const storedSignal = localStorage.getItem('callSignal');
        if (storedSignal) {
            const signalData = JSON.parse(storedSignal);
            console.log('Received signal:', signalData);

            if (from !== currentUser.id) {
                if (!connectionRef.current[from]) {
                    connectionRef.current[from] = new Peer({
                        initiator: false,
                        trickle: false,
                        stream: stream,
                    });

                    connectionRef.current[from].on('stream', (stream) => {
                        if (userAudio.current && from.userId !== currentUser.id) {
                            userAudio.current.srcObject = stream;
                        }
                    });
                }

                connectionRef.current[from].signal(signalData);
                setCaller(from);
                setCallerSignal(signalData);

                if (isRc && from) {

                    addUserToCall(currentUser.id);
                    setCallAccepted(true);

                    const peer = new Peer({
                        initiator: false,
                        trickle: false,
                        stream: stream,
                    });

                    peer.on('signal', (data) => {
                        socket?.emit('answer-call', { signal: data, to: from, userId: currentUser.id, roomId: roomId });
                    });

                    peer.on('stream', (stream) => {
                        userAudio.current.srcObject = stream;
                    });

                    connectionRef.current = peer;
                    peer.signal(signalData);
                }
            }
        }
    }, [socket, currentUser.id, isRc, from])
    const callMessenger = useCallback((roomId) => {
        setCaller(currentUser.id)
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
        });
        console.log(peer)
        // Lắng nghe sự kiện 'signal' từ Peer
        peer.on('signal', (data) => {
            // Gửi tín hiệu gọi đến người dùng khác trong phòng
            if (!isSignalListenerSetRef.current) {
                console.log("tới emit call group")
                socket.emit('call-group', { signalData: data, roomId: roomId, from: currentUser.id });
                console.log("Đã phát call group")
                isSignalListenerSetRef.current = true;
            }
        });

        // Lắng nghe sự kiện 'stream' từ Peer
        peer.on('stream', (stream) => {
            // Xử lý stream âm thanh từ người dùng khác và hiển thị nó
            if (userAudio.current) {
                userAudio.current.srcObject = stream;
            }
        });
        connectionRef.current[currentUser.id] = peer;
        return () => {
            peer.destroy(); // Clean up when component unmounts
        };
    }, [socket])
    useEffect(() => {

        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            setStream(stream);
            if (userAudio.current) {
                userAudio.current.srcObject = stream;
            }
        });
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (typeof process !== 'undefined') { }
            localStorage.removeItem('callSignal');
        }
    }, [])

    //room: converId, name, member[]
    useEffect(() => {

        console.log("71")

        //lấy danh sách user có trong room
        console.log("81")

        socket?.on('update-users', (users) => {
        });

        socket?.on('user-in-room', (roomUsers) => {
            console.log("Đã set roomUser bằng sk.on user-in-room")
        });
        if (isRc == "false") setCaller(currentUser.id)
        //thực hiện thao tác callmess tới tất cả user trong phòng

        console.log(socket)
        /*socket?.on('group-call-made', ({ signal, from }) => {
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
                        if (userAudio.current && from.userId !== currentUser.id) {
                            userAudio.current.srcObject = stream;
                        }
                    });
    
                }
    
                connectionRef.current[from].signal(signal);
                setReceivingCall(true);
                setCaller(from);
                console.log(caller)
                setCallerSignal(signal);
            }
        });*/
        socket?.on('call-accepted', ({ signal, userId }) => {
            setCallAccepted(true);
            const peer = connectionRef.current[caller];
            console.log(userId);
            console.log(caller);
            addUserToCall(userId)

            if (peer) {
                peer.signal(signal);
                console.log("167")
            }
            console.log("169")
        });
        socket?.on('user-disconnected', (userId) => {
            if (connectionRef.current[userId]) {
                connectionRef.current[userId].destroy();
                delete connectionRef.current[userId];
            }
            setUsersInCall(prevUsers => prevUsers.filter(id => id !== userId));
            if (usersInCall.length === 1 && usersInCall[0] === currentUser.id) {
                endCall();
            }
        });
        socket?.on('call-ended', ({ from }) => {
            console.log(from)
            console.log(usersInCall)
            if (from !== currentUser.id) {
                console.log(from)
                alert(from + "kết thúc cuộc gọi");
                if (connectionRef.current[from]) {
                    connectionRef.current[from].destroy();
                    delete connectionRef.current[from];
                }
                setUsersInCall((prevUsers) => {

                    const updatedUsers = prevUsers.filter(id => id !== from);
                    console.log(updatedUsers); // In ra danh sách mới để kiểm tra
                    return updatedUsers;
                });
                console.log(usersInCall)
            } else {
                console.log("169")
            }
        });
        console.log("178")
        return () => {
            socket?.off('update-users');
            socket?.off('user-in-room');
            socket?.off('group-call-made');
            socket?.off('call-accepted');
            socket?.off('user-disconnected');
            socket?.off('call-ended');

        };
    }, [currentUser, socket]);


    const addUserToCall = (userId) => {
        console.log(from)
        if (!(usersInCall.some(id => id === parseInt(from, 10)))) {
            setUsersInCall(prevUsers => [...prevUsers, parseInt(from, 10)]);
        }
        //setUsersInCall(prevUsers => [...prevUsers, userId]);
        setUsersInCall(prevUsers => {
            if (!prevUsers.includes(userId)) {
                return [...prevUsers, userId];
            }
            return prevUsers;
        });
    };
    useEffect(() => {
        if (usersInCall.length === 1 && usersInCall[0] === currentUser.id) {
            endCall();
        }
    }, [usersInCall, currentUser]);
    /*const acceptCall = () => {
        addUserToCall(currentUser.id)
        setCallAccepted(true);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
        });
    
        peer.on('signal', (data) => {
            socket.emit('answer-call', { signal: data, to: caller, roomId: roomId });
        });
    
        peer.on('stream', (stream) => {
            userAudio.current.srcObject = stream;
        });
    
        connectionRef.current = peer;
    
        peer.signal(callerSignal);
    };*/

    const endCall = useCallback(() => {
        console.log("233")
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        console.log("23")
        if (typeof process !== 'undefined') {
            // Thực hiện các thao tác dành riêng cho Node.js
            console.log('Running in Node.js environment');
            Object.values(connectionRef.current).forEach(peer => {
                if (peer && typeof peer.destroy === 'function') {
                    peer.destroy();
                } else {
                    console.error("peer is not an instance of Peer", peer);
                }
            });

            socket.emit('end-call', { roomId: roomId, userId: currentUser.id });
            Object.values(connectionRef.current).forEach(peer => {
                if (peer && typeof peer.on === 'function') {
                    peer.on('close', () => {
                        console.log(`Connection with peer closed: ${peer}`);
                        // Thực hiện các bước dọn dẹp cần thiết
                    });
                } else {
                    console.error("peer is not an instance of Peer", peer);
                }
            });
            connectionRef.current = {};
            setCaller('');
            setCallerSignal(null);
            setCallAccepted(false);
        }
        console.log("258")

    }, [stream, socket, currentUser, roomId]);

    console.log(usersInCall);
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
                </div> : <button onClick={() => callMessenger(roomId)}>Call Messenger</button>}



            </div>
        </div>
    );
};

export default CallWindow;