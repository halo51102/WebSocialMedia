import React, { useContext, useState } from 'react'
import "./header.scss"
import { BsFillBellFill, BsFillEnvelopeFill, BsPersonCircle, BsSearch, BsJustify, BsFileEarmarkPersonFill }
  from 'react-icons/bs'
import { IoLogOut } from "react-icons/io5";
import { useQuery } from '@tanstack/react-query'
import { makeRequest } from '../../axios'
import { AuthContext } from '../../context/authContext'
import profileAlt from "../../assets/profileAlt.png"
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { NotificationContext } from '../../context/notificationContext';
import { MdNotificationsActive } from "react-icons/md";

function Header({ openSidebar, socket }) {
  const { currentUser } = useContext(AuthContext);
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();
  const { notification, showNotification } = useContext(NotificationContext)

  const { isLoading, error, data: findUser } = useQuery(["user"], () =>
    makeRequest.get("/users/find/" + currentUser.id).then((res) => {
      return res.data
    }));

  const handleOpenMenu = () => {
    setOpenMenu(!openMenu);
  }

  const handleLogOut = async () => {
    // e.preventDefault()
    socket?.emit("removeUser", currentUser.id);
    try {
      await axios.post("http://localhost:8800/api/auth/logout")
      localStorage.removeItem('user');
      showNotification("Đăng xuất thành công!!");
      setTimeout(() => {
        navigate("/login")
      }, 1000);
    } catch (err) {
      console.log(err.response.data)
    }
  }

  const handleProfile = () => {
    navigate("/admin/profile");
    setOpenMenu(false);
  }

  return (
    <header className='header'>
      <div className='menu-icon'>
        <BsJustify className='icon' onClick={openSidebar} />
      </div>
      <div className='header-left'>
      </div>
      <div className='header-right'>
        <div className="user" onClick={handleOpenMenu}>
          <img
            src={findUser?.profilePic ? "/upload/" + findUser?.profilePic : profileAlt}
            alt=""
          />
          <span>{findUser?.name}</span>
        </div>
      </div>
      {openMenu
        && <div className='user-menu'>
          {/* <div className='menu-item'
            onClick={handleProfile}>
            <BsFileEarmarkPersonFill />
            <span>Thông tin cá nhân</span>
          </div> */}
          <div className='menu-item' onClick={handleLogOut}>
            <IoLogOut />
            <span>Đăng xuất</span>
          </div>
        </div>
      }
      {notification
        && (<div className="pop-notification">
          <MdNotificationsActive style={{ fontSize: "20px" }} />
          <span>{notification}</span>
        </div>)}
    </header >
  )
}

export default Header