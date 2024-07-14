import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'peerjs';
import "./callvideo.scss";

import profileAlt from "../../assets/profileAlt.png"
const CallVideo = ({ socket, currentUser, callData }) => {

    const videoGridRef = useRef();
    const myVideoRef = useRef(null);

    const backBtnRef = useRef(null);

    const [myVideoStream, setMyVideoStream] = useState(null);
    const [peer, setPeer] = useState(null);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
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
                host: '127.0.0.1',
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
                alert("Cổng không lỗi")
                setMyVideoStream(stream);
                console.log(stream);
                /*if (isRc == "false")*/ addVideoStream(myVideo, stream);
                /*else {
                    if (callData) {
                        const { call, stream } = callData;
                        call.answer(stream);
                        const video = myVideoRef.current;

                        call.on('stream', (userVideoStream) => {
                            addVideoStream(video, userVideoStream);
                        });
                    }
                }*/
                
                newPeer.on("call", (call) => {
                    console.log(call)
                    alert("thiết lập và trả về stream")
                    console.log('someone call me');
                    call.answer(stream);
                    const video = document.createElement("video");
                    call.on("stream", (userVideoStream) => {
                        addVideoStream(video, userVideoStream);
                        call.on("close", () => {
                            console.log(`Call with ${call.peer} closed`);

                            // Giải phóng tất cả các track trong userVideoStream
                            userVideoStream.getTracks().forEach(track => {
                                track.stop(); // Dừng track
                            });

                            // Xóa video element khỏi DOM
                            video.remove();
                        });
                    });
                });

                socket?.on("user-connected", (userId) => {
                    console.log('I call someone ' + userId);
                    const call = newPeer.call(userId, stream);
                    const video = document.createElement("video");
                    console.log(video)
                    console.log(call)
                    call.on("stream", (userVideoStream) => {
                        alert("đã thiết lập call người nhận, chuẩn bị add vào")
                        addVideoStream(video, userVideoStream);
                        call.on("close", () => {
                            console.log(`Call with ${call.peer} closed`);

                            // Giải phóng tất cả các track trong userVideoStream
                            userVideoStream.getTracks().forEach(track => {
                                track.stop(); // Dừng track
                            });

                            // Xóa video element khỏi DOM
                            video.remove();
                        });
                    });
                    call.on("error", (err) => {
                        console.error("Error in call with " + userId, err);
                    });
                    call.on("close", () => {
                        console.log("Call with " + userId + " closed");
                    });
                });



            }).catch((error) => {
                console.log('Error accessing media devices: ', error);
                alert("Không truy cập được camera!");
                navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
                    setMyVideoStream(stream);
                    console.log(stream);
                    /*if (isRc == "false")*/ addVideoStream(myVideo, stream);
                    /*else {
                        if (callData) {
                            const { call, stream } = callData;
                            call.answer(stream);
                            const video = myVideoRef.current;
    
                            call.on('stream', (userVideoStream) => {
                                addVideoStream(video, userVideoStream);
                            });
                        }
                    }*/
                    newPeer.on("call", (call) => {
                        console.log('someone call me');
                        call.answer(stream);
                        const video = document.createElement("video");
                        call.on("stream", (userVideoStream) => {
                            addVideoStream(video, userVideoStream);
                            call.on("close", () => {
                                console.log(`Call with ${call.peer} closed`);

                                // Giải phóng tất cả các track trong userVideoStream
                                userVideoStream.getTracks().forEach(track => {
                                    track.stop(); // Dừng track
                                });

                                // Xóa video element khỏi DOM
                                video.remove();
                            });
                        });

                    });

                    socket?.on("user-connected", (userId) => {
                        console.log('I call someone ' + userId);
                        const call = newPeer.call(userId, stream);
                        const video = document.createElement("video");

                        call.on("stream", (userVideoStream) => {
                            addVideoStream(video, userVideoStream);
                            call.on("close", () => {
                                console.log(`Call with ${call.peer} closed`);

                                // Giải phóng tất cả các track trong userVideoStream
                                userVideoStream.getTracks().forEach(track => {
                                    track.stop(); // Dừng track
                                });

                                // Xóa video element khỏi DOM
                                video.remove();
                            });
                        });
                        call.on("error", (err) => {
                            console.error("Error in call with " + userId, err);
                        });
                        call.on("close", () => {
                            console.log("Call with " + userId + " closed");
                        });
                    });
                })
            });;
            return () => {
                Object.values(peer.connections).forEach(connections => {
                    connections.forEach(call => {
                        call.close(); 
                    });
                });
                if (myVideoStream) {
                    myVideoStream.getTracks().forEach(track => {
                        track.stop();
                    });
                }
                videoGridRef.current.innerHTML = '';
                sessionStorage.removeItem('idpeer');
                socket.disconnect();
                newPeer.destroy();
                roomId = '';
                isRc = false;
            };

        }
    }, [socket, isRc, roomId, callData])

    const addVideoStream = (video, stream) => {
        if (isRc == "false") alert("Tôi vào và bạn vào")
        else alert("Tôi vào và add bạn vào")
        if (!video) return;
        console.log("30")
        /*const hasVideo = stream.getVideoTracks().length > 0;
        if (hasVideo) {
            // Nếu có video track, gán stream vào thẻ video
            video.srcObject = stream;
            video.addEventListener("loadedmetadata", () => {
                video.play();
            });
        } else {
            // Nếu không có video track, tạo thẻ img và sử dụng hình ảnh đại diện
            const img = document.createElement("img");
            img.src = profileAlt;
            img.alt = "User avatar";
            video.replaceWith(img); // Thay thế thẻ video bằng thẻ img
        }
        
        if (videoGridRef.current) {
            videoGridRef.current.append(video);
        }*/
        video.srcObject = stream;
        console.log(video.srcObject)
        video.addEventListener("loadedmetadata", () => {
            alert("đang add vid vào")
            video.play();
            alert("đang add vid vào 2")
            if (videoGridRef.current) {
                videoGridRef.current.append(video);
            }
        });
        videoGridRef.current.scrollTop = videoGridRef.current.scrollHeight;
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
    const handleMuteButtonClick = () => {
        if (myVideoStream) {
            const enabled = myVideoStream.getAudioTracks()[0].enabled;
            myVideoStream.getAudioTracks()[0].enabled = !enabled;
            setIsAudioEnabled(!enabled);
        }
    };

    const handleStopVideoClick = () => {
        if (myVideoStream) {
            const enabled = myVideoStream.getVideoTracks()[0].enabled;
            myVideoStream.getVideoTracks()[0].enabled = !enabled;
            setIsVideoEnabled(!enabled);
        }
    };

    return (
        <div>
            <div className="main">
                <div className="main__left">
                    <div className="options">
                        <div className="options__left">
                            <div id="stopVideo" className={`options__button ${!isVideoEnabled ? 'background__red' : ''}`} onClick={handleStopVideoClick}>
                                <i className={`fa ${isVideoEnabled ? 'fa-video' : 'fa-video-slash'}`}></i>
                            </div>
                            <div id="muteButton" className={`options__button ${!isAudioEnabled ? 'background__red' : ''}`} onClick={handleMuteButtonClick}>
                                <i className={`fa ${isAudioEnabled ? 'fa-microphone' : 'fa-microphone-slash'}`}></i>
                            </div>
                        </div>
                        <div className="options__right">
                            <div id="inviteButton" className="options__button">
                                <i className="fas fa-user-plus"></i>
                            </div>
                        </div>
                    </div>
                    <div className="videos__group">
                        <div id="video-grid" ref={videoGridRef} >
                            <video className='video' playsInline autoPlay ref={myVideoRef} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CallVideo;