import "./topbar.css";
import { SearchOutlined, PersonOutline, ChatOutlined, Notifications } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";

export default function Topbar() {
  const { currentUser } = useContext(AuthContext);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const navigate = useNavigate();
  return (
    <div className="topbarContainer">
      <div className="topbarLeft">
        <Link
          to="http://localhost:3000"
          style={{ textDecoration: "none" }}
          onClick={() => {
            navigate("/");
            window.location.reload();
          }} >
          <span className="logo">WebSocialMedia</span>
        </Link>
      </div>
      <div className="topbarCenter">
        <div className="searchbar">
          <SearchOutlined className="searchIcon" />
          <input
            placeholder="Search for friend, post or video"
            className="searchInput"
          />
        </div>
      </div>
      <div className="topbarRight">
        <div className="topbarLinks">
          <span className="topbarLink">Homepage</span>
          <span className="topbarLink">Timeline</span>
        </div>
        <div className="topbarIcons">
          <div className="topbarIconItem">
            <PersonOutline />
            <span className="topbarIconBadge">1</span>
          </div>
          <div className="topbarIconItem">
            <ChatOutlined />
            <span className="topbarIconBadge">2</span>
          </div>
          <div className="topbarIconItem">
            <Notifications />
            <span className="topbarIconBadge">1</span>
          </div>
        </div>
        <Link
          onClick={() => {
            navigate(`/profile/${currentUser.id}`)
            window.location.reload();
          }}>
          <img
            src={
              currentUser.profilePicture
                ? PF + currentUser.profilePicture
                : PF + "person/noAvatar.png"
            }
            alt=""
            className="topbarImg"
          />
        </Link>
      </div>
    </div>
  );
}
