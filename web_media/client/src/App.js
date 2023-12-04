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
import "./style.scss";
import { useContext, useEffect } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/authContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Friend from "./pages/friend/Friend";
import { io } from "socket.io-client";
import { useState } from "react";

function App() {

  const { currentUser } = useContext(AuthContext);

  const { darkMode } = useContext(DarkModeContext);

  const queryClient = new QueryClient()

  const [user, setUser] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    setSocket(io("http://localhost:5000"));
  }, [])

  useEffect(() => {
    if (socket)
      socket?.emit("newUser", user);
  }, [socket, user]);

  const Layout = () => {
    return (
      <QueryClientProvider client={queryClient}>
        <div className={`theme-${darkMode ? "dark" : "light"}`}>
          <Navbar socket={socket} />
          <div style={{ display: "flex" }}>
            <LeftBar />
            <div style={{ flex: 6 }}>
              <Outlet />
            </div>
            <RightBar />
          </div>
        </div>
      </QueryClientProvider>
    );
  };

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
          element: <Profile />,
        }, {
          path: "/group/all",
          element: <AllGroup />,
        },
        {
          path: "/group/:id",
          element: <Group />,
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
  ]);

  // window.addEventListener('beforeunload', function() {
  //   localStorage.clear();
  // });
  console.log(socket)

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
