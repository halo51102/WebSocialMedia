import "./profile.scss";
import PlaceIcon from "@mui/icons-material/Place";
import LanguageIcon from "@mui/icons-material/Language";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Posts from "../../components/posts/Posts"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import Update from "../../components/update/Update";

const Profile = () => {
  const [openUpdate, setOpenUpdate] = useState(false);
  const { currentUser } = useContext(AuthContext)
  const userId = parseInt(useLocation().pathname.split("/")[2])

  const queryClient = useQueryClient()
  const { isLoading, error, data } = useQuery(["user"], () =>
    makeRequest.get("/users/find/" + userId).then((res) => {
      return res.data
    }))
  const { isLoading: rIsLoading, data: relationshipData } = useQuery(["relationship"], () =>
    makeRequest.get("/relationships?followedUserId=" + userId).then((res) => {
      return res.data
    }))

  const mutation = useMutation((following) => {
    if (following) return makeRequest.delete("/relationships?userId=" + userId);
    return makeRequest.post("/relationships", { userId });
  },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["relationship"])
      }
    }
  );


  const handleFollow = () => {
    mutation.mutate(relationshipData.some(item => item.id === currentUser.id))
  }


  return (
    <div className="profile">
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
          <div className="uInfo">
            <div className="left">
              {/*  */}
            </div>
            <div className="center">
              <span>{data.name}</span>
              <div className="info">
                <div className="item">
                  <PlaceIcon />
                  <span>{data.city}</span>
                </div>
                <div className="item">
                  <LanguageIcon />
                  <span>{data.website}</span>
                </div>
              </div>
              {rIsLoading ? ("loading")
                : userId === currentUser.id ? (<button onClick={() => setOpenUpdate(true)}>update</button>)
                  : (<button onClick={handleFollow}>{relationshipData.some(item => item.id === currentUser.id) ? "Following" : "Follow"}</button>)}
            </div>
            <div className="right">
              <MoreVertIcon />
            </div>
          </div>
          <Posts userId={userId} />
        </div>
      </>}
      {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={data} />}
    </div>
  );
};

export default Profile;