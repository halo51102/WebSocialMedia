import "./group.scss";
import PostsInGroup from "../../components/postsInGroup/PostsInGroup"
import Share from "../../components/share/Share"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import UpdateGroup from "../../components/updateGroup/UpdateGroup";
import { Link } from "react-router-dom";
import { style } from "@mui/system";
import MembersGroup from "../../components/membersGroup/MembersGroup"

const Group = ({socket}) => {
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openMember, setOpenMember] = useState(false);
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
    mutation.mutate(memberData?.some(member => member.userId === currentUser.id))
  }

  return (
    <div className="profilegroup">
      {isLoading ? "loading" : <>
        <div className="images">
          <img
            src={"/upload/" + data?.coverPic}
            alt=""
            className="cover"
          />
          <img
            src={"/upload/" + data?.profilePic}
            alt=""
            className="profilePic"
          />
        </div>
        <div className="profileContainer">
          <div className="center">
            <div className="info">
              <span>{data?.name}</span>
              <span style={{ fontSize: "12px" }}>{data?.desc}</span>
              <Link style={{ textDecoration: "none", fontSize:"12px"}} onClick={() => setOpenMember(true)} >
              <span> {memberData?.length} Member</span>
              </Link>
            </div>
            {mIsLoading ? ("loading")
              : memberData?.some(member => member.userId === currentUser.id && member.position === "admin") ? (<button onClick={() => setOpenUpdate(true)}>update</button>)
                : <button onClick={handleJoinin}>{memberData?.some(member => member.userId === currentUser.id) ? "Out group" : "Join in"}</button>
            }
          </div>
        </div>
        {memberData?.some(member => member.userId === currentUser.id) && <Share/> }
        <PostsInGroup groupId={data?.id} socket={socket} />
      </>}
      {openUpdate && <UpdateGroup setOpenUpdate={setOpenUpdate} group={data} />}
      {openMember && <MembersGroup setOpenMember={setOpenMember} groupId={groupId} />}
    </div>
  );
};

export default Group;
