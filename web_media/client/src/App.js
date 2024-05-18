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
import "./style.scss";
import "./styleAdmin.scss"
import { useContext, useEffect } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/authContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Friend from "./pages/friend/Friend";
import { io } from "socket.io-client";
import { useState } from "react";
import UserList from "./pages/admin/user-list/UserList";
import PostList from "./pages/admin/post-list/PostList";

function App() {

  const { currentUser } = useContext(AuthContext);

  const { darkMode } = useContext(DarkModeContext);

  const queryClient = new QueryClient()

  const [user, setUser] = useState("");
  const [socket, setSocket] = useState(null);

  //ADMIN
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false)
  const openSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle)
  }

  useEffect(() => {
    setSocket(io("http://localhost:8900"));
  }, [])

  useEffect(() => {
    if (socket)
      socket.emit("addUser", currentUser?.id);
  }, [socket, user]);

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
      if (currentUser) {
        setUser(currentUser.username);
      } else {
        setUser("");
      }
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
          <Messenger socket={socket} />
        </ProtectedRoute>
      ),
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
          element: <HomeAdmin socket={socket}/>
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
