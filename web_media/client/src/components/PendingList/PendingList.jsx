import { useContext, useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import "./pendinglist.scss"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import { Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AddMemberGroup } from "../addMemberGroup/AddMemberGroup";

import profileAlt from "../../assets/profileAlt.png"

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

const PendingList = ({ setOpenPendingList}) => {
  
    return (
        <div className="member">
            <div className="wrapper">
                <h1>Pending List</h1>
                
                <button className="close" onClick={() => setOpenPendingList(false)}>
                    x
                </button>
            </div>
        </div>
    );
}

export default PendingList;