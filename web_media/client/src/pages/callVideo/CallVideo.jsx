import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'peerjs';
import "./callvideo.scss";

const CallVideo = ({ socket, currentUser, callData }) => {

    const videoGridRef = useRef();
    const myVideoRef = useRef(null);

    const backBtnRef = useRef(null);

    const [myVideoStream, setMyVideoStream] = useState(null);
    const [peer, setPeer] = useState(null);

    const [userId, setUserId] = useState("");
    const isRc = new URLSearchParams(window.location.search).get('isRc');
    const roomId = parseInt(new URLSearchParams(window.location.search).get('roomId'));
    const generateUniqueId = () => {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    };
    useEffect(() => {
        const handleBackButtonClick = () => {
            document.querySelector(".main__left").style.display = "flex";
            document.querySelector(".main__left").style.flex = "1";
            document.querySelector(".main__right").style.display = "none";
            document.querySelector(".header__back").style.display = "none";
        };

        if (backBtnRef.current) {
            backBtnRef.current.addEventListener("click", handleBackButtonClick);
        }
        return () => {
            if (backBtnRef.current) {
                backBtnRef.current.removeEventListener("click", handleBackButtonClick);
            }
        };
    }, []);
    
    useEffect(() => {
        if (socket) {
            const user = generateUniqueId();
            setUserId(user);

            const newPeer = new Peer(user, {
                host: '192.168.1.189',
                port: 3030,
                path: '/',
                secure: false,
                config: {
                    'iceServers': [
                        { urls: 'stun:stun01.sipphone.com' },
                        { urls: 'stun:stun.ekiga.net' },
                        { urls: 'stun:stunserver.org' },
                        { urls: 'stun:stun.softjoys.com' },
                        { urls: 'stun:stun.voiparound.com' },
                        { urls: 'stun:stun.voipbuster.com' },
                        { urls: 'stun:stun.voipstunt.com' },
                        { urls: 'stun:stun.voxgratia.org' },
                        { urls: 'stun:stun.xten.com' },
                        {
                            urls: 'turn:192.158.29.39:3478?transport=udp',
                            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                            username: '28224511:1379330808'
                        },
                        {
                            urls: 'turn:192.158.29.39:3478?transport=tcp',
                            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                            username: '28224511:1379330808'
                        }
                    ]
                },
                debug: 3
            });

            setPeer(newPeer);
            console.log(newPeer)
            newPeer.on("open", (id) => {
                console.log('my id is ', typeof id, id);
                console.log(socket);
                if (isRc === "false") { socket?.emit("join-room", roomId, id, currentUser.id); console.log("join-room") }
                if (isRc === "true") {
                    const idHisPeer = sessionStorage.getItem('idpeer');
                    console.log("your id is ", typeof idHisPeer, idHisPeer)
                    console.log(socket)
                    socket?.emit("accept-call", { roomId: roomId, id: id, userId: currentUser.id, hispeer: idHisPeer });
                    console.log("accept-call");
                }
                console.log("80: ", typeof isRc, isRc)
            });

            const myVideo = myVideoRef.current;


            if (myVideo) { myVideo.muted = true; console.log(myVideo.muted) }
            console.log(myVideo)


            navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
                setMyVideoStream(stream);
                console.log(stream);
                if (isRc == "false") addVideoStream(myVideo, stream);
                else {
                    if (callData) {
                        const { call, stream } = callData;
                        call.answer(stream);
                        const video = myVideoRef.current;

                        call.on('stream', (userVideoStream) => {
                            addVideoStream(video, userVideoStream);
                        });
                    }
                }
                newPeer.on("call", (call) => {
                    console.log('someone call me');
                    call.answer(stream);
                    const video = document.createElement("video");
                    call.on("stream", (userVideoStream) => {
                        addVideoStream(video, userVideoStream);
                    });
                });

                socket?.on("user-connected", (userId) => {
                    console.log('I call someone ' + userId);
                    const call = newPeer.call(userId, stream);
                    const video = document.createElement("video");
                    call.on("stream", (userVideoStream) => {
                        console.log("add video của đối phương vào client")
                        addVideoStream(video, userVideoStream);
                    });
                });



            }).catch((error) => {
                console.log('Error accessing media devices: ', error);
            });;
            return () => {
                socket.disconnect();
                newPeer.destroy();
            };

        }
    }, [socket, isRc, roomId, callData])


    const addVideoStream = (video, stream) => {
        if (!video) return;
        console.log("30")
        video.srcObject = stream;
        video.addEventListener("loadedmetadata", () => {
            video.play();
            if (videoGridRef.current) {
                videoGridRef.current.append(video);
            }
        });
    };

    const connectToNewUser = (userId, stream) => {
        console.log('I call someone ' + userId);
        if (peer) {
            const call = peer.call(userId, stream);
            const video = document.createElement("video");
            call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream);
            });
        } else {
            console.log('Peer object is not initialized.');
        }
    };

    return (
        <div>
            <div className="main">
                <div className="main__left">
                    <div className="videos__group">
                        <div id="video-grid" ref={videoGridRef} >
                            <video playsInline autoPlay ref={myVideoRef} />
                        </div>
                    </div>
                    <div className="options">
                        <div className="options__left">
                            <div id="stopVideo" className="options__button">
                                <i className="fa fa-video-camera"></i>
                            </div>
                            <div id="muteButton" className="options__button">
                                <i className="fa fa-microphone"></i>
                            </div>
                        </div>
                        <div className="options__right">
                            <div id="inviteButton" className="options__button">
                                <i className="fas fa-user-plus"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CallVideo;