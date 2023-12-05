import "./leftBar.scss";
import Friends from "../../assets/1.png";
import Groups from "../../assets/2.png";
import Watch from "../../assets/4.png";
import Gallery from "../../assets/8.png";
import Videos from "../../assets/9.png";
import Messages from "../../assets/10.png";
import { AuthContext } from "../../context/authContext";
import { useContext, useState } from "react";
import axios from "axios"
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";



const LeftBar = () => {

  const { currentUser } = useContext(AuthContext);

  const [err, setErr] = useState(null)

  const navigate = useNavigate();

  let group = "/group"

  const handleClick = async (e) => {
    e.preventDefault()

    try {
      await axios.post("http://localhost:8800/api/auth/logout")
      localStorage.removeItem('user');
      navigate("/login")
    } catch (err) {
      setErr(err.response.data)
    }
  }

  const { isLoading, error, data: findUser } = useQuery(["user"], () =>
    makeRequest.get("/users/find/" + currentUser.id).then((res) => {
      return res.data
    }))

  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          <Link
            to={"/profile/" + currentUser.id}
            style={{ textDecoration: "none", marginTop: "13px", color: "inherit" }}
            // onClick={() => {
            //   navigate("/profile/" + currentUser.id, { replace: true });
            //   window.location.reload();
            // }}
          >
            <div className="user">
              <img
                src={"/upload/" + findUser?.profilePic}
                alt=""
              />
              <span>{findUser?.name}</span>
            </div>
          </Link>
          <div className="item">
            <Link
              className="link"
              to="/friend"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <img src={Friends} alt="" />
              <span>Follower</span>
            </Link>
          </div>
          <div className="item">
            <img src={Groups} alt="" />
            <Link
              to="/group/all"
              style={{ textDecoration: "none", color: "inherit" }}>
              <span>Group</span>
            </Link>
          </div>
          <div className="item">
            <img src={Watch} alt="" />
            <span>Watch</span>
          </div>
        </div>
        <hr />
        <div className="menu">
          <span>Your shortcuts</span>
          <div className="item">
            <img src={Gallery} alt="" />
            <span>Gallery</span>
          </div>
          <div className="item">
            <img src={Videos} alt="" />
            <span>Videos</span>
          </div>
          <div className="item">
            <img src={Messages} alt="" />
            <span>Messages</span>
          </div>
        </div>
        <hr />
        <div className="menu">
          <span>Others</span>
        </div>
        {err && err}
        <button onClick={handleClick}>LogOut</button>
      </div>
    </div>
  );
};

export default LeftBar;
