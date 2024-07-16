import { useContext, useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import "./pendinglist.scss"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import { Link } from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";
import { AddMemberGroup } from "../addMemberGroup/AddMemberGroup";

import profileAlt from "../../assets/profileAlt.png"

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

const PendingList = ({ setOpenPendingList }) => {

    return (
        <div className="member">
            <div className="wrapper">
                <h1>Pending List</h1>
                <div className="userlist">
                    <div className="memberInfo">
                        <Link
                            style={{ textDecoration: "none" }}
                            to={"/profile/"}
                            onClick={() => {
                                Navigate("/profile/");
                                window.location.reload();
                            }}
                        >
                            <div className="user">
                                <div className="userInfo">
                                    <img
                                        src={profileAlt}
                                        alt=""
                                    />
                                    <span>Name</span>
                                </div>
                            </div>
                        </Link>
                        <div className="btnPend">
                            <button> Chấp nhận</button>
                            <button> Từ chối</button>
                        </div>
                    </div>
                </div>
                <button className="close" onClick={() => setOpenPendingList(false)}>
                    x
                </button>
            </div>
        </div>
    );
}

export default PendingList;