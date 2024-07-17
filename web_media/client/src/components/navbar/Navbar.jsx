import "./navbar.scss";
// import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
// import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { RiLockPasswordLine } from "react-icons/ri";
import { IoLogOutOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";
import { SearchResults } from "../searchResults/SearchResults";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import profileAlt from "../../assets/profileAlt.png"
import ChangePassword from "../changePassword/ChangePassword";
import moment from "moment";
import { NotificationContext } from "../../context/notificationContext";
import { MdNotificationsActive } from "react-icons/md";
import { GrLogout } from "react-icons/gr";
import { IoCloseCircle } from "react-icons/io5";
import { useRef } from "react";
import ChatBot from "../chatbot/ChatBot";
import "../chatbot/Chatbot.scss"
import PrivacyProfile from "../privacyProfile/PrivacyProfile";
import { TbMessageChatbot } from "react-icons/tb";

const Navbar = ({ socket }) => {
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  // const [notifications, setNotifications] = useState([]);
  const [results, setResults] = useState([]);
  const [input, setInput] = useState("");
  const [openNotications, setOpenNotifications] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [isOpenSearchResults, setIsOpenSearchResults] = useState(false);
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { notification, showNotification } = useContext(NotificationContext)
  const notiRef = useRef();

  let id = (String)(currentUser.id)
  let profile = "/profile/" + id

  const { isLoading, error, data: findUser } = useQuery(["user"], () =>
    makeRequest.get("/users/find/" + currentUser.id).then((res) => {
      return res.data
    }))

  const { error: notificationsError, data: notificationsData } = useQuery(["notifications"], () =>
    makeRequest.get("/notifications?receiverId=" + currentUser.id).then((res) => {
      return res.data
    }))

  // useEffect(() => {
  //   socket?.on("getNotification", (data) => {
  //     setNotifications((prev) => [...prev, data]);
  //   });
  // }, [socket]);


  const fetchData = (value) => {
    fetch("http://localhost:8800/api/users")
      .then((response) => response.json())
      .then((json) => {
        const results = json.filter(user =>
          user.name.toLowerCase().includes(value) || user.username.toLowerCase().includes(value)
        );
        setResults(results);
      });
  };

  const handleSearch = (e) => {
    setInput(e.target.value);
    fetchData(e.target.value.trim());
    setIsOpenSearchResults(true);
  };

  const handleCloseSearchResults = () => {
    setInput('');
    setIsOpenSearchResults(false);
    fetchData('');
  }

  const displayNotification = ({ senderName, type }) => {
    let action;

    if (type === 1) {
      action = "like";
    } else if (type === 2) {
      action = "dislike";
    } else if (type === 3) {
      action = "comment on";
    } else {
      action = "shared";
    }
    return (
      <span className="notification">{`${senderName} ${action} your post.`}</span>
    );
  };

  const handleOpenMenu = () => {
    setOpenMenu(!openMenu);
    setOpenNotifications(false);
  }

  const handleOpenNotifications = () => {
    setOpenNotifications(!openNotications);
    setOpenMenu(false);
  }
  const handleOpenChat = () => {
    if (!openChat) setOpenChat(true)
    else setOpenChat(false)
  }
  const handleLogOut = async (e) => {
    e.preventDefault()
    socket?.emit("removeUser", currentUser.id);
    try {
      await makeRequest.post("http://localhost:8800/api/auth/logout")
      localStorage.removeItem('user');
      showNotification("Đăng xuất thành công!!")

      setTimeout(() => {
        navigate("/login")
      }, 1000);
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="navbar">
      <div className="left">
        <Link to="/" style={{ textDecoration: "none", marginTop: "13px" }}>
          <span>WebSocialMedia</span>
        </Link>

        <div className="search-container">
          <div className="search">
            <SearchOutlinedIcon />
            <input
              type="text"
              value={input}
              onChange={handleSearch}
              placeholder="Nhập từ khóa..."
            />
            {input !== "" &&
              <div
                style={{ cursor: 'pointer' }}
                onClick={handleCloseSearchResults}>
                <IoCloseCircle />
              </div>}
          </div>
          {input !== ''
            && isOpenSearchResults
            && <SearchResults results={results} input={input} />}
        </div>
        {openChat && <ChatBot setOpenChat={setOpenChat} />}
      </div>

      <div className="right" onClick={handleCloseSearchResults}>
        <div className='icon' >
          <TbMessageChatbot style={{fontSize: '25px'}} onClick={handleOpenChat} />
        </div>
        {darkMode ? (
          <div className='icon' >
            <WbSunnyOutlinedIcon onClick={toggle} />
          </div>
        ) : (
          <div className='icon' >
            <DarkModeOutlinedIcon onClick={toggle} />
          </div>
        )}
        {/* <div className="icon" onClick={() => navigate('/friend')}>
          <PersonOutlinedIcon />
        </div> */}
        <div className="icon" onClick={() => navigate('/messenger')}>
          <EmailOutlinedIcon />
        </div>
        <div className="icon" ref={notiRef}>
          <NotificationsOutlinedIcon onClick={handleOpenNotifications} />
          {openNotications
            && <div className="icon-click">
              <NotificationsOutlinedIcon onClick={handleOpenNotifications} />
            </div>
          }
        </div>
        <Link
          to="#"
          onClick={handleOpenMenu}
        >
          <div className="user">
            <img
              src={findUser?.profilePic ? findUser?.profilePic : profileAlt}
              alt=""
            />
          </div>
        </Link>
        {openNotications && (notificationsData?.length === 0 ?
          (<div className="notifications">
            <span className="notification">Không có thông báo gần đây</span>
          </div>) :
          (<div className="notifications">
            {notificationsData.map((noti) =>
              <span className="notification">
                {`${noti.name} ${noti.type} bài viết của bạn.`}
                <span className="date">{moment(noti.create_at).fromNow()}</span>
              </span>)}
          </div>))
        }
        {openUpdate && <ChangePassword setOpenUpdate={setOpenUpdate} user={findUser} />}
        {openPrivacy && <PrivacyProfile setOpenPrivacy={setOpenPrivacy} currentUser={currentUser} />}
        {openMenu
          && <div className="menu">
            <div className="menu-item"
              onClick={() => {
                navigate(`/profile/${currentUser.id}`);
                setOpenMenu(false)
              }}>
              <CgProfile style={{ fontSize: "25px" }} />
              <span>Trang cá nhân</span>
            </div>
            <div className="menu-item"
              onClick={() => {
                setOpenPrivacy(true);
                setOpenMenu(false)
              }} >
              <RiLockPasswordLine style={{ fontSize: "20px" }} />
              <span>Quyền riêng tư</span>
            </div>
            <div className="menu-item"
              onClick={() => {
                setOpenUpdate(true);
                setOpenMenu(false)
              }} >
              <RiLockPasswordLine style={{ fontSize: "20px" }} />
              <span>Đổi mật khẩu</span>
            </div>
            <div className="menu-item"
              onClick={handleLogOut}
            >
              <GrLogout style={{ fontSize: "20px" }} />
              <span>Đăng xuất</span>
            </div>
          </div>}
      </div>
      {
        notification
        && (<div className="pop-notification" onClick={handleCloseSearchResults}>
          <MdNotificationsActive style={{ fontSize: "20px" }} />
          <span>{notification}</span>
        </div>)
      }
    </div >
  );
};

export default Navbar;
