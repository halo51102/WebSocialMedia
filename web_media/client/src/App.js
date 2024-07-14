import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import LeftBar from "./components/leftBar/LeftBar";
import RightBar from "./components/rightBar/RightBar";
import Home from "./pages/home/Home";
import Group from "./pages/group/Group"
import Profile from "./pages/profile/Profile";
import AllGroup from "./pages/allGroup/AllGroup"
import Messenger from "./pages/messenger/messenger"
import SideBar from "./components/sideBar/SideBar";
import Header from "./components/navBar-admin/Header";
import HomeAdmin from "./pages/admin/home/HomeAdmin";
import CallVideo from "./pages/callVideo/CallVideo";
import "./style.scss";
import "./styleAdmin.scss"
import { useCallback, useContext, useEffect, useRef } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/authContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Friend from "./pages/friend/Friend";
import { io } from "socket.io-client";
import { useState } from "react";
import UserList from "./pages/admin/user-list/UserList";
import PostList from "./pages/admin/post-list/PostList";
import VerifyEmail from "./pages/verify-email/VerifyEmail";
import Peer from "peerjs";
import { makeRequest } from "./axios";

function App() {

  const { currentUser } = useContext(AuthContext);

  const { darkMode } = useContext(DarkModeContext);

  const queryClient = new QueryClient()

  const [user, setUser] = useState('');

  console.log(currentUser)

  const [socket, setSocket] = useState(null);
  const [socketId, setSocketId] = useState(null);
  //ADMIN
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false)
  const openSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle)
  }

  const [incomingCall, setIncomingCall] = useState(null);
  const callWindowRef = useRef(null);
  const broadcastChannel = useRef(new BroadcastChannel('socket_channel'));
  const [callData, setCallData] = useState(null);
  useEffect(() => {
    setSocket(io("http://localhost:8900"));
    // Kết nối đến server socket.io
    /*const socket = io('http://localhost:8900', {
      query: { socketId: localStorage.getItem('socketId') } // Lấy socketId từ localStorage nếu có
    });
    console.log(socket)
    socket.on('connect', () => {
      /*console.log('Connected to server!');
      const id = newSocket.id; // Lấy socketId mới từ server
      console.log(id)
      setSocketId(id); // Lưu vào state
      localStorage.setItem('socketId', id); // Lưu vào localStorage
      console.log(localStorage.getItem('socketId'))

      setSocketId(socket.id);
      localStorage.setItem('socketId', socket.id);
    });
    setSocket(socket)*/
  }, [])

  useEffect(() => {
    const newPeer = new Peer();

    /*newPeer.on('call', (call) => {
      console.log('someone call me');
      setCallData(call);
    });*/
    if (socket) {
      console.log(socket)
      socket.emit("addUser", currentUser?.id);


      socket.on('group-call-made', ({ roomId, from, idpeer }) => {
        console.log(from)

        if (from !== currentUser?.id) {
          if (window.confirm(`Incoming call from user ${from}. Do you want to accept?`)) {
            /*const signalData = signal; // Lấy signal từ sự kiện hoặc từ state của bạn
            
            setIncomingCall({ signalData: signalData, from: from, roomId: roomId });*/
            sessionStorage.setItem('idpeer', JSON.stringify(idpeer));

            handleAcceptCall(roomId, from, idpeer);
          }

        }
        console.log(socket.id)

      })

    }
  }, [socket, currentUser]);

  const handleAcceptCall = (roomId, from, idpeer) => {
    //const { from } = incomingCall;
    //console.log(from)

    window.open(`/call?roomId=${roomId}&isRc=true&from=${from}`, 'Call Window', 'width=900,height=600');
    console.log("callData ", callData)
    /*const url = `/call?roomId=${roomId}&isRc=true&from=${from}`;
    callWindowRef.current = window.open(url, '_blank', 'width=400,height=400');

    // Send data to the new window
    callWindowRef.current.onload = () => {
      callWindowRef.current.postMessage({
        type: 'incomingCall',
        signalData: signalData,
        from: from,
        roomId: roomId,
        currentUser: currentUser,
      }, '*');
    };

    setIncomingCall({ signalData: signalData, from: from, roomId: roomId, isAccepted: true });*/
  };
  /*{incomingCall && (
            <div>
              <p>Incoming call from user {incomingCall.from}</p>
              <button onClick={handleAcceptCall}>Accept</button>
            </div>
          )}
          không dùng alert*/
  const Layout = () => {
    return (
      <QueryClientProvider client={queryClient}>
        <div className={`theme-${darkMode ? "dark" : "light"}`}>
          <Navbar socket={socket} />
          <div style={{ display: "flex" }}>
            <LeftBar socket={socket} user={user} />
            <div style={{ flex: 6 }}>
              <Outlet />
            </div>
            <RightBar socket={socket} user={user} />
          </div>
        </div>
      </QueryClientProvider>
    );
  };

  const LayoutAdmin = () => {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="grid-container">
          <Header openSidebar={openSidebar} socket={socket} />
          <SideBar openSidebarToggle={openSidebarToggle} openSidebar={openSidebar} />
          <Outlet />
        </div>
      </QueryClientProvider>
    )
  }

  const ProtectedRoute = ({ children }) => {
    useEffect(() => {
      const auth = async () => {
        if (currentUser) {
          setUser(currentUser.username);
          await makeRequest.post('/auth/authorize', { username: currentUser.username });
        } else {
          setUser("");
        }
      };
      auth();
    }, [currentUser]);

    if (!currentUser) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/",
          element: <Home socket={socket} user={user} />,
        },
        {
          path: "/profile/:id",
          element: <Profile socket={socket} user={user} />,
        },
        {
          path: "/group/all",
          element: <AllGroup />,
        },
        {
          path: "/group/:id",
          element: <Group socket={socket} user={user} />,
        },
        {
          path: "/friend",
          element: <Friend />,
        },
      ],
    },
    {
      path: "/verify",
      element: <VerifyEmail />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/messenger",
      element: (
        <ProtectedRoute>
          <QueryClientProvider client={queryClient}>
            <Messenger socket={socket} />
          </QueryClientProvider>
        </ProtectedRoute>
      ),
    },
    {
      path: "/call",
      element: <CallVideo socket={socket} currentUser={currentUser} callData={callData} />

    },
    {
      path: "/admin",
      element: (
        <ProtectedRoute>
          <LayoutAdmin />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/admin",
          element: <HomeAdmin socket={socket} />
        },
        {
          path: "/admin/users",
          element: <UserList />
        },
        {
          path: "/admin/posts",
          element: <PostList />
        }
      ]
    }
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
