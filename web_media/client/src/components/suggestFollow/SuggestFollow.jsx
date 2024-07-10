import { useQuery } from "@tanstack/react-query";
import profileAlt from "../../assets/profileAlt.png"
import { makeRequest } from "../../axios";
import "../rightBar/rightBar.scss";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authContext";

const SuggestFollow = ({ suggestUser, handleFollow }) => {
    const navigate = useNavigate();
    // const [whoFollowData, setWhoFollowData] = useState([]);
    const { currentUser } = useContext(AuthContext)

    // useEffect(() => {
    //     const fetch = async () => {
    //         const res = await makeRequest.get("/relationships/who-follow?followedUserId=" + suggestUser.id);
    //         console.log(res);
    //     };
    //     fetch();
    // }, [currentUser]);

    const { data: whoFollowData } = useQuery(["who-follow"], () =>
        makeRequest.get("/relationships/who-follow?followedUserId=" + suggestUser.id).then((res) => {
            return res.data
        }));
    console.log(suggestUser)
    return (
        <div className="user" >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Link to={"/profile/" + suggestUser.id} style={{ textDecoration: "none", color: "inherit" }}
                    onClick={() => {
                        navigate(`/profile/${suggestUser.id}`);
                        window.location.reload();
                    }}>
                    <div className="userInfo">
                        <img
                            src={suggestUser?.profilePic ? suggestUser.profilePic : profileAlt}
                            alt=""
                        />
                        <span>{suggestUser.name} </span>
                    </div>
                </Link>
                <div className="who-follow">
                    {
                        Array.isArray(whoFollowData) && whoFollowData?.length === 2
                            ? <p>{whoFollowData[0]?.name} và {whoFollowData[1]?.name} cũng theo dõi</p>
                            : Array.isArray(whoFollowData) && whoFollowData?.length > 2
                                ? <p>{whoFollowData[0]?.name} và {whoFollowData[1]?.name} và người khác cũng theo dõi</p>
                                : Array.isArray(whoFollowData) && <p>{whoFollowData[0]?.name} cũng theo dõi</p>
                    }
                </div>
            </div>
            <div className="buttons">
                <button onClick={() => handleFollow()}>Follow</button>
            </div>
        </div>
    )
};
export default SuggestFollow;