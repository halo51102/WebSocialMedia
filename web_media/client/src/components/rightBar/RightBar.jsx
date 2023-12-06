import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import "./rightBar.scss";

const RightBar = ({ socket, user }) => {
  const { currentUser } = useContext(AuthContext)
  const [onlineUser, setOnlineUser] = useState([]);

  useEffect(() => {
    socket?.on("getUsers", (data) => {
      console.log(data)
      setOnlineUser(data);
    })
  }, [socket])


  const { isLoading: sgId, error: sgEr, data: sgdata } = useQuery(["allusers"], () =>
    makeRequest.get("/users/").then((res) => {
      return res.data
    }))
  console.log(sgdata)
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
    mutation.mutate(!relationshipData.some(item => item.id === userId && item.id === currentUser.id) && userId)
  }
  console.log(relationshipData)


  return (
    <div className="rightBar">
      <div className="container">
        <div className="item">
          <span>Suggestions For You</span>

          {sgId ? "loading"
            : sgdata.map((usersg) => {
              (relationshipData.some(item => (item.id !== usersg.id && usersg.id !== currentUser.id))) ?
                <div className="user">
                  <div className="userInfo">
                    <img
                      src={"/upload/" + usersg.profilePic}
                      alt=""
                    />
                    <span>{usersg.name} </span>
                  </div>
                  <div className="buttons">
                    {!relationshipData.some(item => item.followedUserId === usersg.followedUserId && item.followerUserId === currentUser.id) && <button onClick={() => handleFollow(usersg.id)}>Follow</button>}

                  </div>
                </div>
                : <div></div>
            }
            )}



        </div>
        {/* <div className="item">
          <span>Latest Activities</span>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt=""
              />
              <p>
                <span>Jane Doe</span> changed their cover picture
              </p>
            </div>0
            <span>1 min ago</span>
          </div>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt=""
              />
              <p>
                <span>Jane Doe</span> changed their cover picture
              </p>
            </div>
            <span>1 min ago</span>
          </div>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt=""
              />
              <p>
                <span>Jane Doe</span> changed their cover picture
              </p>
            </div>
            <span>1 min ago</span>
          </div>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt=""
              />
              <p>
                <span>Jane Doe</span> changed their cover picture
              </p>
            </div>
            <span>1 min ago</span>
          </div>
        </div> */}
        <div className="item">
          <span>Online Following</span>
          {relationshipData?.map((user) =>
          (<div className="user">
            <div className="userInfo">
              <img
                src={"/upload/" + user.profilePic}
                alt=""
              />
              {onlineUser.some(data => data.userId === user.username) && <div className="online" />}
              <span>{user.name}</span>
            </div>
          </div>)
          )}
        </div>
      </div>
    </div>
  );
};

export default RightBar;
