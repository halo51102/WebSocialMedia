import "./group.scss";
import FacebookTwoToneIcon from "@mui/icons-material/FacebookTwoTone";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import PinterestIcon from "@mui/icons-material/Pinterest";
import TwitterIcon from "@mui/icons-material/Twitter";
import PlaceIcon from "@mui/icons-material/Place";
import LanguageIcon from "@mui/icons-material/Language";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PostsInGroup from "../../components/postsInGroup/PostsInGroup"
import Posts from "../../components/posts/Posts"
import Share from "../../components/share/Share"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";

const Group = () => {

  const { currentUser } = useContext(AuthContext)
  const groupId = parseInt(useLocation().pathname.split("/")[2])

  const queryClient = useQueryClient()
  const { isLoading, error, data } = useQuery(["groups"], () =>
    makeRequest.get("/groups?id=" + groupId).then((res) => {
      return res.data[0]
    }))


  const handleFollow = () => {
    
  }

  return (
    <div className="profile">
      {isLoading ? "loading" : <>
        <div className="images">
          <img
            src={data.coverPic}
            alt=""
            className="cover"
          />
          <img
            src={data.profilePic}
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
