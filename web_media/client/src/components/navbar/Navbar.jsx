import "./navbar.scss";
// import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
// import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect} from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";
import { SearchResults } from "../searchResults/SearchResults";

const Navbar = ({socket}) => {
  const [notifications, setNotifications] = useState([]);
  const [results, setResults] = useState([]);
  const [input, setInput] = useState("");

  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);

  let id = (String)(currentUser.id)
  let profile = "/profile/" + id

  const navigate = useNavigate();

  useEffect(() => {
    socket?.on("getNotification", (data) => {
      setNotifications((prev) => [...prev, data]);
    });
  }, [socket]);

  console.log(notifications)
  
    const fetchData = (value) => {
    fetch("http://localhost:8800/api/users")
      .then((response) => response.json())
      .then((json) => {
        const results = json.filter((user) => {
          return (
            value &&
            user &&
            user.name &&
            user.name.toLowerCase().includes(value) &&
            user.username.toLowerCase().includes(value)
          );
        });
        setResults(results);
      });
  };

  const handleChange = (value) => {
    setInput(value);
    fetchData(value);
  };

  const displayNotification = ({ senderName, type }) => {
    let action;

    if (type === 1) {
      action = "liked";
    } else if (type === 2) {
      action = "disliked";
    } else {
      action = "shared";
    }
    return (
      <span className="notification">{`${senderName} ${action} your post.`}</span>
    );
  };

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
              placeholder="Tìm kiếm..."
              onChange={(e) => handleChange(e.target.value)}
            />
          </div>
          {results && results.length > 0 && <SearchResults results={results} />}
        </div>
      </div>
      <div className="right">
        {darkMode ? (
          <WbSunnyOutlinedIcon onClick={toggle} />
        ) : (
          <DarkModeOutlinedIcon onClick={toggle} />
        )}
        <Link to="/friend" style={{ textDecoration: "none", color: "inherit", marginTop: "3px" }}><PersonOutlinedIcon /></Link>
        <Link to="#" style={{ textDecoration: "none", color: "inherit", marginTop: "3px" }}><EmailOutlinedIcon /></Link>
        <NotificationsOutlinedIcon />
        <Link
          to={profile}
          onClick={() => {
            navigate("/profile/" + currentUser.id, { replace: true });
            window.location.reload();
          }}>
          <div className="user">
            <img
              src={"/upload/" + currentUser.profilePic}
              alt=""
            />
          </div>
        </Link>
        <div className="notifications">
          {notifications.map((noti) => displayNotification(noti))}
        </div>
      </div>
    </div>
  );
};

export default Navbar;