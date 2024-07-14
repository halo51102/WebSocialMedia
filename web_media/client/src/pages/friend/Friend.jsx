import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import "./friend.scss"
import profileAlt from "../../assets/profileAlt.png"
import PendingList from "../../components/PendingList/PendingList"

const Friend = () => {
    const { currentUser } = useContext(AuthContext)
    const [openPendinglist, setOpenPendingList] = useState(false)
    const { isLoading, error, data } = useQuery(["relationships"], () =>
        makeRequest.get("/relationships?followedUserId=" + currentUser.id).then((res) => {
            return res.data;
        })
    );

    const navigate = useNavigate();

    let empty = []

    console.log(data);

    return (
        <div className="friends">
            <div className="container">
                <div className="header-pend">
                    <h1>Follower</h1>
                    <button onClick={() => { setOpenPendingList(true) }}>Phê duyệt</button>
                    {openPendinglist && <PendingList setOpenPendingList={setOpenPendingList}/>}
                </div>
                <div className="item">
                    {error
                        ? "Something went wrong!"
                        : isLoading
                            ? "loading"
                            : data?.map((friend, id) =>
                                <div className="item-container">
                                    <Link
                                        style={{ textDecoration: "none" }}
                                        to={"/profile/" + friend.id}
                                    >
                                        <div className="user" key={id}>
                                            <div className="userInfo">
                                                <img
                                                    src={friend?.profilePic ? friend?.profilePic : profileAlt}
                                                    alt=""
                                                />
                                                <span>{friend.name}</span>
                                            </div>
                                        </div>
                                    </Link>

                                </div>
                            )
                    }
                </div>
            </div>

        </div>
    );
}

export default Friend;