import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import "./friend.scss"

const Friend = () => {
    const { currentUser } = useContext(AuthContext)

    const { isLoading, error, data } = useQuery(["relationships"], () =>
        makeRequest.get("/relationships?followedUserId=" + currentUser.id).then((res) => {
            return res.data;
        })
    );

    console.log(data);

    return (
        <div className="friends">
            <div className="container">
                <div className="item">
                    {error
                        ? "Something went wrong!"
                        : isLoading
                            ? "loading"
                            : data.map((friend, id) =>
                            (<div className="user" key={id}>
                                <div className="userInfo">
                                    <img
                                        src={"/upload/" + friend.profilePic}
                                        alt=""
                                    />
                                    <span>{friend.username}</span>
                                </div>
                                <div className="buttons">
                                    <button>Unfriend</button>
                                </div>
                            </div>))
                    }
                </div>
            </div>

        </div>
    );
}

export default Friend;