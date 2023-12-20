import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import "./rightBar.scss";
import { Link } from "react-router-dom";
import profileAlt from "../../assets/profileAlt.png"

const RightBar = ({ socket, user }) => {
  const { currentUser } = useContext(AuthContext)
  const [onlineUser, setOnlineUser] = useState([]);

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
      }
    }
  );
  const handleFollow = (userId) => {
    mutation.mutate(!relationshipData?.some(item => item.id === userId && item.id === currentUser.id) && userId)
  }

  return (
    <div className="rightBar">
      <div className="container">
        <div className="item">
          <span>Suggestions For You</span>

          {sgdata?.map((usersg) =>
            (!relationshipData?.some(item => item.id === usersg.id)) && (currentUser.id !== usersg.id) &&
            <div className="user" >
              <Link to={"/profile/" + usersg.id} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="userInfo">
                  <img
                    src={usersg?.profilePic ? "/upload/" + usersg.profilePic : profileAlt}
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
          (<Link to={"/profile/" + user.id} style={{ textDecoration: "none", color: "inherit" }} >
            <div className="user">
              <div className="userInfo">
                <img
                  src={user?.profilePic ? "/upload/" + user?.profilePic : profileAlt}
                  alt=""
                />
                {onlineUser?.some(data => data.userId === user.username) && <div className="online" />}
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
