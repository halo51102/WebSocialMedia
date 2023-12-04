import "./post.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link, useLocation } from "react-router-dom";
import Comments from "../comments/Comments";
import { useContext, useState } from "react";
import moment from "moment"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";


const Post = ({ post, isCommentOpen, openComment, closeComment }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  // const [commentOpen, setCommentOpen] = useState(null)
  const { currentUser } = useContext(AuthContext)
  const { isLoading: gIsLoading, error: gError, data: gData } = useQuery(["membersgroup"], () =>
    makeRequest.get("/groups/" + post.groupId + "/members").then((res) => {
      return res.data
    }))

  const { isLoading, error, data } = useQuery(["likes", post.id], () =>
    makeRequest.get("/likes?postId=" + post.id).then((res) => {
      return res.data
    }))

  const queryClient = useQueryClient()

  const mutation = useMutation((liked) => {
    if (liked) return makeRequest.delete("/likes?postId=" + post.id);
    return makeRequest.post("/likes", { postId: post.id });
  },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["likes"])
      }
    }
  );

  const deletePostMutation = useMutation((postId) => {
    return makeRequest.delete("/posts/" + postId);
  },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["posts"])
      }
    }
  );
  const deletePostMutationG = useMutation(() => {
    console.log(post.id+""+post.groupId)
    return makeRequest.delete("/posts/" + post.id+"/"+post.groupId);
  },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["posts"])
      }
    }
  );

  const handleLike = () => {
    mutation.mutate(data.includes(currentUser.id))
  }

  const handleDelete = () => {
    deletePostMutation.mutate(post.id)
  }
  const handleDeleteG = () => {
    console.log(post.id+""+post.groupId)
    deletePostMutationG.mutate()
  }

  const handleToggleComment = () => {
    if (isCommentOpen) {
      closeComment();
    } else {
      openComment(post.id);
    }
  };

  let profile = "/profile/" + post.userId;

  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo">
            <img src={"/upload/" + post.profilePic} alt="" />
            <div className="details">
              <Link
                to={profile}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{post.name}</span>
              </Link>
              <span className="date">{moment(post.createdAt).fromNow()}</span>
            </div>
          </div>
          <MoreHorizIcon onClick={() => setMenuOpen(!menuOpen)} />
          {menuOpen && post.userId === currentUser.id && <button onClick={handleDelete}>Delete</button>}
          {menuOpen && gData.some(member => member.position === "admin"&& member.userId===currentUser.id && member.groupId===post.groupId)&& post.userId!==currentUser.id && <button onClick={handleDeleteG}>Delete Post of member</button>}
        </div>

        <div className="content">
          <p>{post.desc}</p>
          <img src={"/upload/" + post.img} alt="" />
        </div>
        <div className="info">
          <div className="item">
            {isLoading ? (
              "loading"
            ) :
              error ? "error" : data.includes(currentUser.id) ? (
                <FavoriteOutlinedIcon style={{ color: "red" }} onClick={handleLike} />) : (<FavoriteBorderOutlinedIcon onClick={handleLike} />)}
            {data?.length} Likes
          </div>
          <div className="item" onClick={handleToggleComment}>
            <TextsmsOutlinedIcon />
            See Comments
          </div>
          <div className="item">
            <ShareOutlinedIcon />
            Share
          </div>
        </div>
        {isCommentOpen && <Comments postId={post.id} />}
      </div>
    </div>
  );
};

export default Post;
