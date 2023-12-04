import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useContext} from "react";
import { AuthContext } from "../../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import "./friend.scss"

const Friend = () => {
    const { currentUser } = useContext(AuthContext)

    const { isLoading, error, data } = useQuery(["relationships"], () =>
        makeRequest.get("/relationships?followedUserId=" + currentUser.id).then((res) => {
            return res.data;
        })
    );

    const navigate = useNavigate();


    console.log();

    return (
        <div className="friends">
            <div className="container">
                <div className="item">
                    {error
                        ? "Something went wrong!"
                        : isLoading
                            ? "loading"
                            : data.map((friend, id) =>
                            (<Link
                                style={{ textDecoration: "none" }}
                                to={"/profile/" + friend.id}
                                onClick={() => {
                                    navigate("/profile/" + friend.id, { replace: true });
                                    window.location.reload();
                                }}
                            >
                                <div className="user" key={id}>
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
                                </div>
                            </Link>
                            ))
                    }
                </div>
            </div>

        </div>
    );
}

export default Friend;