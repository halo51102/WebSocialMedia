import { useContext, useEffect, useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import "./pendinglist.scss"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import { Link, useRadioGroup } from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";
import { AddMemberGroup } from "../addMemberGroup/AddMemberGroup";

import profileAlt from "../../assets/profileAlt.png"

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { NotificationContext } from "../../context/notificationContext";

const PendingList = ({ setOpenPendingList }) => {


    const { change, setChange } = useState(false)
    const { showNotification } = useContext(NotificationContext)
    const queryClient = useQueryClient()
    const { isLoading, error, data } = useQuery(["pendingList"], () =>
        makeRequest.get("/relationships/pending").then((res) => {
            return res.data;
        })
    );
    console.log(data)

    const handleAccept = async (userId) => {
        acceptMutation.mutate(userId);
    }
    const acceptMutation = useMutation((userId) => {
        return makeRequest.put('/relationships/acceptFollowed', { followedUserId: userId, pend: 1 })
    },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["pendingList"])
            }
        }
    );
    const handleReject = async (userId) => {
        rejectMutation.mutate(userId);
    }
    const rejectMutation = useMutation((userId) => {
        return makeRequest.delete('/relationships/rejectFollowed?userId=' + userId)
    },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["pendingList"])
            }
        }
    );

    return (
        <div className="member">
            <div className="wrapper">
                <h1>Pending List</h1>
                {data?.map((pend, keyId) =>
                    <div className="userlist">
                        <div className="memberInfo">
                            <Link
                                style={{ textDecoration: "none" }}
                                to={`/profile/${pend.id}`}
                                onClick={() => {
                                    Navigate("/profile/");
                                    window.location.reload();
                                }}
                            >
                                <div className="user">
                                    <div className="userInfo">
                                        <img
                                            src={pend.profliePic ? pend.profliePic : profileAlt}
                                            alt=""
                                        />
                                        <span>{pend.name}</span>
                                    </div>
                                </div>
                            </Link>
                            <div className="btnPend">
                                <button onClick={() => { handleAccept(pend.id) }}> Chấp nhận</button>
                                <button onClick={() => { handleReject(pend.id) }}> Từ chối</button>
                            </div>
                        </div>
                    </div>
                )}
                <button className="close" onClick={() => setOpenPendingList(false)}>
                    x
                </button>
            </div>
        </div>
    );
}

export default PendingList;