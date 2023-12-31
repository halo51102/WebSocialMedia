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
import SharePost from "../sharePost/SharePost";
import Share from "../share/Share";
import profileAlt from "../../assets/profileAlt.png"
import { NotificationContext } from "../../context/notificationContext";


const Post = ({ post, isCommentOpen, openComment, closeComment, socket, user, whichPage }) => {

  const [menuOpen, setMenuOpen] = useState(false)
  // const [commentOpen, setCommentOpen] = useState(null)
  const { currentUser } = useContext(AuthContext)
  const [showImage, setShowImage] = useState(false);
  const [shareOpen, setShareOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { showNotification } = useContext(NotificationContext)

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
  const shareId = post.sharePostId
  const { isLoading: shareIsLoading, error: shareError, data: shareData } = useQuery(["posts", post.sharePostId], () =>
    makeRequest.get("/posts/s/" + post.sharePostId).then((res) => {
      return res.data[0]
    }))

  const notificationMutation = useMutation((type) => {
    return makeRequest.post("/notifications",
      {
        senderId: currentUser.id,
        receiverId: post.userId,
        type: type
      },
    );
  },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["notifications"])
      }
    });

  const likeMutation = useMutation((liked) => {
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

  const reportMutation = useMutation(() => {
    console.log(post.id)
    return makeRequest.put("/posts/report/" + post.id, { status: "reported" });
  },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["allPosts"])
      }
    })

  const handleDelete = () => {
    setConfirmDelete(true);
  }

  const handleConfirmDelete = () => {
    setConfirmDelete(false);
    deletePostMutation.mutate(post.id)
    showNotification("Xóa bài viết thành công!!")
  }

  const handleDeleteG = () => {
    console.log(post.id + "" + post.groupId)
    deletePostMutationG.mutate()
    showNotification("Đã xóa bài viết của thành viên")
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
    likeMutation.mutate(liked);

    if (currentUser.id !== post.id) {
      if (liked) {
        // Nếu đã thích, gửi socket thông báo unlike
        handleNotification(2);
        notificationMutation.mutate("hủy thích")
      } else {
        // Nếu chưa thích, gửi socket thông báo like
        handleNotification(1);
        notificationMutation.mutate("thích")
      }
    }
  }

  const handleNotification = (type) => {
    socket?.emit("sendNotification", {
      senderId: currentUser.id,
      receiverId: post.userId,
      type
    });
  };

  const handleReport = () => {
    reportMutation.mutate();
    setMenuOpen(false);
    showNotification("Bài viết đã được báo cáo, hãy chờ xử lý của ADMIN.")
  }

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
    <div >
      <div className="post">
        <div className="container">
          <div className="user">
            <div className="userInfo">
              <img src={post?.profilePic ? "/upload/" + post?.profilePic : profileAlt} alt="" />
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
            <MoreHorizIcon
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ position: "absolute", right: 0, cursor: "pointer" }}
            />
            {
              (
                menuOpen && gData?.some(
                  member => member.position === "admin" &&
                    member.userId === currentUser.id &&
                    member.groupId === post.groupId
                )
                && post.userId !== currentUser.id
              )
                ? <div className="post-menu" >
                  <span onClick={handleReport}>Báo cáo bài viết</span>
                  <span onClick={handleDeleteG}>Xóa bài viết thành viên</span>
                </div>
                : menuOpen && <div className="post-menu" >
                  <span onClick={handleReport}>Báo cáo bài viết</span>
                  {post.userId === currentUser.id &&
                    <span onClick={handleDelete}>Xóa bài viết</span>
                  }
                </div>

            }
            {menuOpen
              && post.userId === currentUser.id
              && <button
                onClick={handleDelete}
                style={{ padding: "10px", borderRadius: "10px" }}>Delete</button>
            }

            {/* {menuOpen
              && post.userId !== currentUser.id
              && <div className="post-menu" onClick={handleReport}>
                <span>Báo cáo bài viết</span>
              </div>
            } */}


          </div>

          <div className="content">
            <p>{post.desc}</p>
            <img src={"/upload/" + post.img}
              alt=""
              onClick={() => handleImageClick("/upload/" + post.img)} />
          </div>


          {post.sharePostId && <div className="sharePost">
            <div className="userShare">
              <div className="contentShare">
                <img src={"/upload/" + shareData?.img}
                  alt=""
                  onClick={() => handleImageClick("/upload/" + shareData?.img)} />
              </div>

            </div>
            <div className="userInfoShare">
              <img src={shareData?.profilePic ? "/upload/" + shareData?.profilePic : profileAlt} alt="" />
              <div className="detailShare">
                <Link
                  to={"/profile/" + shareData?.userId}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span className="nameShare">{shareData?.name}</span>
                </Link>
                <span className="dateShare">{moment(shareData?.createdAt).fromNow()}</span>
              </div>
            </div>
            <div className="contentShare">
              <p>{shareData?.desc}</p>
            </div>
          </div>}



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
            {(post.userId !== currentUser.id)
              && <div className="item" onClick={() => setShareOpen(true)}>
                <ShareOutlinedIcon />
                Share
              </div>
            }
          </div>
          {isCommentOpen && <Comments postId={post.id} socket={socket} user={user} post={post} />}
          {shareOpen && <SharePost setShareOpen={setShareOpen} postShare={post} />}
        </div>
        {showImage && (
          <div className="image-container">
            <img src={selectedImage} alt="" />
            <button onClick={handleImageClose}></button>
          </div>
        )}
        {confirmDelete &&
          (<div className="confirm-delete">
            <span>Bạn chắc chắn muốn xóa bài viết?</span>
            <div className="button-confirm">
              <button onClick={handleConfirmDelete}>Xóa</button>
              <button onClick={() => {
                setConfirmDelete(false);
                setMenuOpen(false)
              }}>
                Hủy</button>
            </div>
          </div>)}
      </div>
    </div>
  );
};

export default Post;
