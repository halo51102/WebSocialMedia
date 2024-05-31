import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import "./rightBar.scss";
import { Link, useNavigate } from "react-router-dom";
import profileAlt from "../../assets/profileAlt.png"

const RightBar = ({ socket, user }) => {
  const { currentUser } = useContext(AuthContext)
  const [onlineUser, setOnlineUser] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    socket?.on("getUsers", (data) => {
      setOnlineUser(data);
    })
  }, [socket])


  const { isLoading: sgId, error: sgEr, data: sgdata } = useQuery(["allusers"], () =>
    makeRequest.get("/users/").then((res) => {
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

  console.log(onlineUser)
  return (
    <div className="rightBar">
      <div className="container">
        <div className="item">
          <span>Suggestions For You</span>

          {sgdata?.map((usersg) =>
            (!relationshipData?.some(item => item.id === usersg.id)) && (currentUser.id !== usersg.id) &&
            <div className="user" >
              <Link to={"/profile/" + usersg.id} style={{ textDecoration: "none", color: "inherit" }}
                onClick={() => {
                  navigate(`/profile/${usersg.id}`);
                  window.location.reload();
                }}>
                <div className="userInfo">
                  <img
                    src={usersg?.profilePic ? usersg.profilePic : profileAlt}
                    alt=""
                  />
                  <span>{usersg.name} </span>
                </div>
              </Link>
              <div className="buttons">
                {!relationshipData?.some(item => item.id === usersg.id) && <button onClick={() => handleFollow(usersg.id)}>Follow</button>}

              </div>
            </div>

          )}
        </div>

        <div className="item">
          <span>Following</span>
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
