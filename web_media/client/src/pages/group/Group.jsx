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

  const { isLoading: mIsLoading, data: memberData } = useQuery(["membersgroup"], () =>
    makeRequest.get("/groups/" + groupId + "/members").then((res) => {
      return res.data
    }))

  const mutation = useMutation((joined) => {
    if (joined) return makeRequest.delete("/groups/" + groupId + "/members");
    return makeRequest.post("/groups/" + groupId + "/members");
  },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["membersgroup"])
      }
    }
  );


  const handleJoinin = () => {
    mutation.mutate(memberData.some(member => member.userId === currentUser.id))
  }
  const handleUpdate = () => {

  }
  console.log("a")
  console.log(memberData)
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
              <span style={{ fontSize: "12px" }}>{data.desc}</span>
            </div>
            {mIsLoading ? ("loading")
              : memberData.some(member => member.userId === currentUser.id && member.position === "admin") ? (<button onClick={handleUpdate}>update</button>)
                : <button onClick={handleJoinin}>{memberData.some(member => member.userId === currentUser.id) ? "Out group" : "Join in"}</button>
            }
          </div>
        </div>
        <Share/>
        <PostsInGroup groupId={data.id} />

      </>}
    </div>
  );
};

export default Group;
