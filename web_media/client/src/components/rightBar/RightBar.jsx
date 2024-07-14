import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import "./rightBar.scss";
import { Link, useNavigate } from "react-router-dom";
import profileAlt from "../../assets/profileAlt.png"
import SuggestFollow from "../suggestFollow/SuggestFollow";
import { FaUserFriends } from "react-icons/fa";

const RightBar = ({ socket, user }) => {
  const { currentUser } = useContext(AuthContext)
  const [onlineUser, setOnlineUser] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    socket?.on("getUsers", (data) => {
      setOnlineUser(data);
    })
  }, [socket])


  const { isLoading: sgId, error: sgEr, data: sgdata } = useQuery(["suggest-follow"], () =>
    makeRequest.get("/relationships/suggest-follow").then((res) => {
      return res.data
    }))

  const { isLoading: rIsLoading, data: relationshipData } = useQuery(["followed"], () =>
    makeRequest.get("/relationships/ed?followerUserId=" + currentUser.id).then((res) => {
      return res.data
    }))
  const queryClient = useQueryClient()
  const mutation = useMutation((userId) => {
    return makeRequest.post("/relationships", { userId });
  },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["followed"])
        queryClient.invalidateQueries(["relationship"])
      }
    }
  );
  const handleFollow = (userId) => {
    mutation.mutate(!relationshipData?.some(item => item.id === userId && item.id === currentUser.id) && userId)
  }

  console.log(sgdata)
  return (
    <div className="rightBar">
      <div className="container">
        <div className="item">
          <span>Đề xuất kết bạn</span>
          {
            sgdata?.length === 0
              ? <div className="no-suggest-friend">
                <FaUserFriends className="icon-nsf" />
                <p>Kết thêm bạn để hiện đề xuất</p>
              </div>
              : sgdata?.map((usersg) =>
                (!relationshipData?.some(item => item.id === usersg.id)) && (currentUser.id !== usersg.id) &&
                <SuggestFollow suggestUser={usersg} handleFollow={() => { handleFollow(usersg.id) }} />
              )
          }
        </div>
        <div className="item">
          <span>Đang theo dõi</span>
          {relationshipData?.map((user) =>
          (<Link to=""
            style={{ textDecoration: "none", color: "inherit" }}
            onClick={() => {
              navigate(`/profile/${user.id}`);
              window.location.reload();
            }} >
            <div className="user">
              <div className="userInfo">
                <img
                  src={user?.profilePic ? user?.profilePic : profileAlt}
                  alt=""
                />
                {onlineUser?.some(data => data.userId === user.id) && <div className="online" />}
                <span>{user.name}</span>
              </div>
            </div>
          </Link>)
          )}
        </div>
      </div>
    </div>
  );
};

export default RightBar;
