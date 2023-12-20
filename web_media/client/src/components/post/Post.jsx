import "./post.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useContext, useState } from "react";
import moment from "moment"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";


const Post = ({ post, isCommentOpen, openComment, closeComment, socket, user, whichPage }) => {

  const [menuOpen, setMenuOpen] = useState(false)
  // const [commentOpen, setCommentOpen] = useState(null)
  const { currentUser } = useContext(AuthContext)
  const [showImage, setShowImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const { isLoading: gIsLoading, error: gError, data: gData } = useQuery(["membersgroup"], () =>
    makeRequest.get("/groups/" + post.groupId + "/members").then((res) => {
      return res.data
    }))

  const { isLoading, error, data } = useQuery(["likes", post.id], () =>
    makeRequest.get("/likes?postId=" + post.id).then((res) => {
      return res.data
    }))

  const { isLoading: pIdLoading, error: pError, data: pData } = useQuery(["users"], () =>
    makeRequest.get("/users/findByPost/" + post.id).then((res) => {
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
        queryClient.invalidateQueries(["post"])
        queryClient.invalidateQueries(["postsInGroup"])
      }
    }
  );

  const deletePostMutationG = useMutation(() => {
    console.log(post.id + "" + post.groupId)
    return makeRequest.delete("/posts/" + post.id + "/" + post.groupId);
  },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["post"])
        queryClient.invalidateQueries(["postsInGroup"])
      }
    }
  );

  const handleDelete = () => {
    deletePostMutation.mutate(post.id)
    // window.location.reload();
  }
  const handleDeleteG = () => {
    console.log(post.id + "" + post.groupId)
    deletePostMutationG.mutate()
  }

  const handleToggleComment = () => {
    if (isCommentOpen) {
      closeComment();
    } else {
      openComment(post.id);
    }
  };

  const handleLike = () => {
    const liked = data?.includes(currentUser.id)
    mutation.mutate(liked);

    if (currentUser.id !== post.id) {
      if (liked) {
        // Nếu đã thích, gửi socket thông báo unlike
        handleNotification(2);

      } else {
        // Nếu chưa thích, gửi socket thông báo like
        handleNotification(1);

      }
    }
  }

  const handleNotification = (type) => {
    socket?.emit("sendNotification", {
      senderName: user,
      receiverName: post.username,
      type,
    });
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImage(true);
  }

  const handleImageClose = () => {
    setShowImage(false);
    setSelectedImage('');
  }

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
          {menuOpen && gData?.some(
            member => member.position === "admin" &&
              member.userId === currentUser.id &&
              member.groupId === post.groupId) &&
            post.userId !== currentUser.id &&
            <button onClick={handleDeleteG}>Delete Post of member</button>}
        </div>

        <div className="content">
          <p>{post.desc}</p>
          <img src={"/upload/" + post.img} 
          alt=""
          onClick={()=>handleImageClick("/upload/" + post.img)} />
        </div>
        <div className="info">
          <div className="item">
            {isLoading ? (
              "loading"
            ) :
              error ? "error" : data?.includes(currentUser.id) ? (
                <FavoriteOutlinedIcon
                  style={{ color: "red" }}
                  onClick={handleLike} />) :
                (<FavoriteBorderOutlinedIcon
                  onClick={handleLike} />)}
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
        {isCommentOpen && <Comments postId={post.id} socket={socket} user={user} post={post} />}
      </div>
      {showImage && (
        <div className="image-container">
          <img src={selectedImage} alt="" />
          <button onClick={handleImageClose}></button>
        </div>
      )}
    </div>
  );
};

export default Post;
