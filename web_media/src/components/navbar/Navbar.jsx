import "./navbar.scss";
// import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
// import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";
import { SearchResults } from "../searchResults/SearchResults";

const Navbar = () => {
  const [results, setResults] = useState([]);
  const [input, setInput] = useState("");

  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);

  let id = (String)(currentUser.id)
  let profile = "/profile/" + id


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
        <Link to="/friend" ><PersonOutlinedIcon /></Link>
        <Link to="/chat" ><EmailOutlinedIcon /></Link>
        <NotificationsOutlinedIcon />
        <Link to={profile}>
          <div className="user">
            <img
              src={"/upload/" + currentUser.profilePic}
              alt=""
            />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
