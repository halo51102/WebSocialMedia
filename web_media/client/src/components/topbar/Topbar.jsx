import "./topbar.css";
import { SearchOutlined, PersonOutline, ChatOutlined, Notifications } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";
import { useState } from "react";

export default function Topbar() {
  const { currentUser } = useContext(AuthContext);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState("");
  const [isActive, setIsActive] = useState('');

  const getProfilePic = async () => {
    const res = await makeRequest.get("/users/find/" + currentUser.id);
    setProfilePic(res.data.profilePic);
  };

  useEffect(() => {
    getProfilePic();
  })

  return (
    <div className="topbarContainer">
      <div className="topbarLeft">
        <Link
          to="http://localhost:3000"
          style={{ textDecoration: "none" }}
        // onClick={() => {
        //   navigate("/");
        //   window.location.reload();
        // }} 
        >
          <span className="logo">WebSocialMedia</span>
        </Link>
      </div>


      <div className="topbarRight">
        <Link
          onClick={() => {
            navigate(`/profile/${currentUser.id}`);
          }}
          className={`userPic ${isActive === 'userPic' ? 'active' : ''}`}
          style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "10px" }}
        >
          <span className="topbarUsername">{currentUser.name}</span>
          <img
            src={
              profilePic
                ? profilePic
                : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png"
            }
            alt=""
            className="topbarImg"
          />

        </Link>
      </div>
    </div>
  );
}
