import "./leftBar.scss";
import Friends from "../../assets/1.png";
import Groups from "../../assets/2.png";
import Watch from "../../assets/4.png";
import Gallery from "../../assets/8.png";
import Videos from "../../assets/9.png";
import Messages from "../../assets/10.png";
import Home from "../../assets/home.png";
import { AuthContext } from "../../context/authContext";
import { useContext, useState } from "react";
import axios from "axios"
import { Link, useNavigate } from "react-router-dom";
import { NotificationContext } from "../../context/notificationContext";

const LeftBar = ({ socket, user }) => {

  const { currentUser } = useContext(AuthContext);
  const [err, setErr] = useState(null)
  const navigate = useNavigate();
  const { showNotification } = useContext(NotificationContext)

  let group = "/group"

  const handleLogOut = async (e) => {
    e.preventDefault()
    socket?.emit("removeUser", currentUser.id);
    try {
      await axios.post("http://localhost:8800/api/auth/logout")
      localStorage.removeItem('user');
      showNotification("Đăng xuất thành công!!")

      setTimeout(() => {
        navigate("/login")
      }, 1000);
    } catch (err) {
      setErr(err.response.data)
    }
  }

  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          <Link
            to={"/"}
            style={{ textDecoration: "none", marginTop: "13px", color: "inherit" }}
          >
            <div className="item">
              <img
                src={Home}
                alt=""
              />
              <span>Trang chủ</span>
            </div>
          </Link>
          <div className="item">
            <Link
              className="link"
              to="/friend"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <img src={Friends} alt="" />
              <span>Người theo dõi</span>
            </Link>
          </div>
          <div className="item">
            <img src={Groups} alt="" />
            <Link
              to="/group/all"
              style={{ textDecoration: "none", color: "inherit" }}>
              <span>Nhóm</span>
            </Link>
          </div>
          <div className="item">
            <img src={Messages} alt="" />
            <Link
              to='/messenger'
              style={{ textDecoration: "none", color: "inherit" }}>
              <span>Tin nhắn</span>
            </Link>
          </div>
        </div>
        <hr />
        {err && err}
        <button style={{display: "none"}} onClick={handleLogOut}>LogOut</button>
      </div>
    </div>
  );
};

export default LeftBar;
