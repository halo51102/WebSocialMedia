import "./group.scss";
import PostsInGroup from "../../components/postsInGroup/PostsInGroup"
import Share from "../../components/share/Share"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { margin, padding } from "@mui/system";

const Group = () => {

  const { currentUser } = useContext(AuthContext)
  const groupId = parseInt(useLocation().pathname.split("/")[2])

  const queryClient = useQueryClient()
  const { isLoading, error, data } = useQuery(["profilegroup"], () =>
    makeRequest.get("/groups/" + groupId).then((res) => {
      return res.data
    }))


  const handleFollow = () => {
    
  }
  console.log("a")
  console.log(data?.coverPic)
  return (
    <div className="profile">
      {isLoading ? "loading" : <>
        <div className="images">
          <img
            src={"/upload/"+data.coverPic}
            alt=""
            className="cover"
          />
          <img
            src={"/upload/"+data.profilePic}
            alt=""
            className="profilePic"
          />
        </div>
        <div className="profileContainer">
        <div className="center">
            <span>{data.name}</span>
            <button onClick={handleFollow}>Join In</button>
          </div>
          </div>
          <Share />
          <PostsInGroup groupId={data.id} />
       
      </>}
    </div>
  );
};

export default Group;
