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
    <div className="profilegroup">
      {isLoading ? "loading" : <>
        <div className="images">
          <img
            src={"/upload/" + data.coverPic}
            alt=""
            className="cover"
          />
          <img
            src={"/upload/" + data.profilePic}
            alt=""
            className="profilePic"
          />
        </div>
        <div className="profileContainer">
          <div className="center">
            <div className="info">
              <span>{data.name}</span>
              <span style={{fontSize:"12px"}}>{data.desc}</span>
            </div>
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
