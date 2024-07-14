import "./post.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useContext, useState, useEffect } from "react";
import moment from "moment"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import SharePost from "../sharePost/SharePost";
import Share from "../share/Share";
import profileAlt from "../../assets/profileAlt.png"
import { NotificationContext } from "../../context/notificationContext";
import ListTagPost from "../listTagPost/ListTagPost";
import ReactPlayer from 'react-player';
import { useRef } from "react";
import { IoMdWarning } from "react-icons/io";
import axios from "axios";
import AutoPlayVideo from "../autoPlayVideo/AutoPlayVideo";
import {
  LoadingOutlined
} from '@ant-design/icons';
import ImageWithLoader from "../imageWithLoader/ImageWithLoader";

const Post = ({ post, isCommentOpen, openComment, closeComment, socket, user, whichPage }) => {

  const [menuOpen, setMenuOpen] = useState(false)
  // const [commentOpen, setCommentOpen] = useState(null)
  const { currentUser } = useContext(AuthContext)
  const [showImage, setShowImage] = useState(false);
  const [shareOpen, setShareOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { showNotification } = useContext(NotificationContext)

  const [openTag, setOpenTag] = useState(false);

  const buttonOptionRef = useRef();
  const [faces, setFaces] = useState([]);
  const [containerSize, setContainerSize] = useState([]);
  const [hoverFace, setHoverFace] = useState(false);
  const [faceId, setFaceId] = useState('');
  const [faceName, setFaceName] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(true);
  const [naturalSize, setNaturalSize] = useState([]);
  const [zoom, setZoom] = useState(0);
  const [weapons, setWeapons] = useState([]);
  const [isDetectingWeapon, setIsDetectingWeapon] = useState(true);
  const [hoverWeapon, setHoverWeapon] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState([]);

  const divRef = useRef(null);

  useEffect(() => {
    if (divRef.current) {
      console.log('inside')
      console.log(divRef.current.offsetWidth, divRef.current.offsetHeight)
      setContainerSize([divRef.current.offsetWidth, divRef.current.offsetHeight]);
    }
  }, [showImage]);

  useEffect(() => {
    setZoom(containerSize[0] > naturalSize[0] ? containerSize[0] / naturalSize[0] : naturalSize[0] / containerSize[0]);
  }, [containerSize, naturalSize]);

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


  const { isLoading: shareIsLoading, error: shareError, data: shareData } = useQuery(["posts", post.sharePostId], () =>
    makeRequest.get("/posts/s/" + post.sharePostId).then((res) => {
      return res.data[0]
    }))

  // Lấy hình ảnh của post
  const { isLoading: imagesIsLoading, error: imagesError, data: imagesData } = useQuery(["imagesOfPost", post.id], () =>
    makeRequest.get("/posts/images?postId=" + post.id).then((res) => {
      return res.data
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

    if (currentUser.id !== post.userId) {
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

  const handleImageClick = async (image) => {
    setSelectedImage(image);
    setShowImage(true);

    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Accept'] = 'application/json';

    const formData = new FormData();
    formData.append("text", image);
    try {
      setIsRecognizing(true);
      const res = await axios.post("http://localhost:8002/predict", formData);
      if (res.data.results.length > 0) {
        setFaces(res.data.results);
        setNaturalSize(res.data.size);
      }
      setIsRecognizing(false);
      console.log(res.data)
    }
    catch (err) {
      showNotification('Lỗi server');
    }

    try {
      setIsDetectingWeapon(true);
      const res = await axios.post("http://localhost:8003/predict", formData);
      if (res.data.results.length > 0) {
        setWeapons(res.data.results);
        setNaturalSize(res.data.size);
      }
      setIsDetectingWeapon(false);
      console.log(res.data)
    }
    catch (err) {
      showNotification('Lỗi server');
    }
  }

  const handleImageClose = () => {
    setShowImage(false);
    setSelectedImage('');
    setFaces([]);
  }

  const handleHoverFace = async (e, faceId) => {
    setHoverFace(true);
    setFaceId(faceId);
    if (faceId == 'unknown') {
      setFaceName('Không rõ');
    } else {
      const res = await makeRequest.get("users/find/" + faceId);
      setFaceName(res.data.name);
    }
  }

  const handleHoverWeapon = (e, weapon) => {
    setHoverWeapon(true);
    setSelectedWeapon(weapon);
  }

  let profile = "/profile/" + post.userId;

  return (
    <div >
      <div className="post">
        <div className="container">
          <div className="user">
            <div className="userInfo">
              <img src={post?.profilePic ? post?.profilePic : profileAlt} alt="" />
              <div className="details">
                <Link
                  to={profile}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span className="name">{post.name}</span>
                  {post.quantityTag >= 1 && <span> gắn thẻ cùng với <Link style={{ textDecoration: "none", fontSize: "12px" }} onClick={() => setOpenTag(true)}>{post.quantityTag} người khác</Link></span>

                  }</Link>
                <span className="date">{moment(post.createdAt).fromNow()}</span>
              </div>
            </div>
            <div className="button-option-post"
              onClick={() => {
                setMenuOpen(!menuOpen);
              }}>
              <MoreHorizIcon />
              {menuOpen
                &&
                <div className="button-option-post"
                  onClick={() => {
                    setMenuOpen(!menuOpen);
                  }}
                  style={{ background: 'lightgray', borderRadius: '50%', position: 'absolute', top: 0, left: 0 }}
                >
                  <MoreHorizIcon />
                </div>
              }
            </div>
            {post.status === "bad" && <IoMdWarning className='warning-icon' />}
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
                : menuOpen
                && <div className="post-menu" >
                  {post.userId === currentUser.id &&
                    <span onClick={handleDelete}>Xóa bài viết</span>
                  }
                  <span onClick={handleReport}>Báo cáo bài viết</span>
                </div>
            }
            {openTag && <ListTagPost setOpenTag={setOpenTag} postId={post.id} />}
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
            {post.status === 'bad'
              ? <p style={{ fontSize: '13px', fontStyle: 'italic' }}>Nội dung phản cảm đã được che giấu...</p>
              : post.desc && <p style={{ fontSize: '14px' }}>{post.desc}</p>}
            {imagesError
              ? "erorr"
              : imagesIsLoading
                ? "loading"
                : imagesData.length === 0
                  ? ""
                  : Array.isArray(imagesData) && imagesData.length === 1
                    ? imagesData.map((data) => (
                      data.img.includes("mp4")
                        ? <AutoPlayVideo src={data.img} />
                        : <ImageWithLoader src={data.img} alt='' onClick={() => handleImageClick(data.img)} />
                    ))
                    : Array.isArray(imagesData) && imagesData.length === 2
                      ? <div className="media">
                        <div className="media-2">
                          {imagesData[0]?.img.includes("mp4")
                            ? <video width="100%" height="" controls>
                              <source src={imagesData[0]?.img} type="video/mp4" />
                            </video>
                            : <img src={imagesData[0]?.img}
                              alt="lỗi image"
                              onClick={() => handleImageClick(imagesData[0]?.img)} />}
                        </div>
                        <div className="media-2">
                          {imagesData[1]?.img.includes("mp4")
                            ? <video width="100%" height="" controls>
                              <source src={imagesData[1]?.img} type="video/mp4" />
                            </video>
                            : <img src={imagesData[1]?.img}
                              alt="lỗi image"
                              onClick={() => handleImageClick(imagesData[1]?.img)} />}
                        </div>
                      </div>
                      : Array.isArray(imagesData) && imagesData.length === 3   //có 3 media
                        ? <div className="media">
                          <div className="media-2">
                            {
                              imagesData[0]?.img.includes("mp4")
                                ? <video width="100%" height="" controls>
                                  <source src={imagesData[0]?.img} type="video/mp4" />
                                </video>
                                : <img src={imagesData[0]?.img}
                                  alt="lỗi image"
                                  onClick={() => handleImageClick(imagesData[0]?.img)} />
                            }
                          </div>
                          <div className="media-2">
                            <div className="media-3">
                              {
                                imagesData[1]?.img.includes("mp4")
                                  ? <video width="100%" height="" controls>
                                    <source src={imagesData[1]?.img} type="video/mp4" />
                                  </video>
                                  : <img src={imagesData[1]?.img}
                                    alt="lỗi image"
                                    onClick={() => handleImageClick(imagesData[1]?.img)} />
                              }
                            </div>
                            <div className="media-3">
                              {
                                imagesData[2]?.img.includes("mp4")
                                  ? <video width="100%" height="" controls>
                                    <source src={imagesData[2]?.img} type="video/mp4" />
                                  </video>
                                  : <img src={imagesData[2]?.img}
                                    alt="lỗi image"
                                    onClick={() => handleImageClick(imagesData[2]?.img)} />
                              }
                            </div>
                          </div>
                        </div>
                        : Array.isArray(imagesData) //nhiều hơn 3 media
                        &&
                        <div className="media">
                          <div className="media-2">
                            {
                              imagesData[0]?.img.includes("mp4")
                                ? <video width="100%" height="" controls>
                                  <source src={imagesData[0]?.img} type="video/mp4" />
                                </video>
                                : <img src={imagesData[0]?.img}
                                  alt="lỗi image"
                                  onClick={() => handleImageClick(imagesData[0]?.img)} />
                            }
                          </div>
                          <div className="media-2">
                            <div className="media-3">
                              {
                                imagesData[1]?.img.includes("mp4")
                                  ? <video width="100%" height="" controls>
                                    <source src={imagesData[1]?.img} type="video/mp4" />
                                  </video>
                                  : <img src={imagesData[1]?.img}
                                    alt="lỗi image"
                                    onClick={() => handleImageClick(imagesData[1]?.img)} />
                              }
                            </div>
                            <div className="media-3">
                              {
                                imagesData[2]?.img.includes("mp4")
                                  ? <video width="100%" height="" controls>
                                    <source src={imagesData[2]?.img} type="video/mp4" />
                                  </video>
                                  : <img src={imagesData[2]?.img}
                                    alt="lỗi image"
                                    onClick={() => handleImageClick(imagesData[2]?.img)} />
                              }
                            </div>
                            <div className="media-3"
                              style={{ position: 'absolute', zIndex: 1, width: '50%', top: '155px' }}
                            >
                              <span style={{ alignSelf: 'center', fontSize: '100px' }}>+</span>
                            </div>
                          </div>
                        </div>
            }

          </div>


          {post.sharePostId && <div className="sharePost">
            <div className="userShare">
              <div className="contentShare">
                <img src={shareData?.img}
                  alt=""
                  onClick={() => handleImageClick(shareData?.img)} />
              </div>

            </div>
            <div className="userInfoShare">
              <img src={shareData?.profilePic ? shareData?.profilePic : profileAlt} alt="" />
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
              {data?.length} Thích
            </div>
            <div className="item" onClick={handleToggleComment}>
              <TextsmsOutlinedIcon />
              Bình luận
            </div>
            {(post.userId !== currentUser.id)
              && <div className="item" onClick={() => setShareOpen(true)}>
                <ShareOutlinedIcon />
                Chia sẻ
              </div>
            }
          </div>
          {isCommentOpen && <Comments postId={post.id} socket={socket} user={user} post={post} />}
          {shareOpen && <SharePost setShareOpen={setShareOpen} postShare={post} />}
        </div>
        {showImage && (
          <div className="image-container" >
            <div className="left" ref={divRef}>
              <img className="image" src={selectedImage} alt="" />
              <button onClick={handleImageClose}>x</button>
              {isRecognizing
                ? <span className="is-recognizing">Đang nhận diện khuôn mặt...</span>
                : faces.length > 0
                && faces.map((face) => (
                  <div
                    className="face"
                    style={{
                      position: 'absolute',
                      width: `${(face[1][1] - face[1][3]) * zoom}px`,
                      height: `${(face[1][2] - face[1][0]) * zoom}px`,
                      top: `${face[1][0] * zoom}px`,
                      left: `${face[1][3] * zoom}px`,
                      border: `${hoverFace && faceId === face[0] ? '2px solid green' : 'none'}`
                    }}
                    onMouseEnter={(e) => handleHoverFace(e, face[0])}
                    onMouseLeave={() => setHoverFace(false)}>
                    {hoverFace && faceId === face[0]
                      && <span className="face-name" style={{ position: 'absolute' }}>{faceName}</span>}
                  </div>
                ))}
              {isDetectingWeapon
                ? <span className="is-recognizing">Đang nhận diện vũ khí...</span>
                : weapons.length > 0
                && weapons.map((weapon) => (
                  <div
                    className="face"
                    style={{
                      position: 'absolute',
                      width: `${weapon[1][2] * zoom}px`,
                      height: `${weapon[1][3] * zoom}px`,
                      top: `${weapon[1][1] * zoom}px`,
                      left: `${weapon[1][0] * zoom}px`,
                      border: `${hoverWeapon && selectedWeapon === weapon ? '2px solid green' : 'none'}`,
                      background: 'black'
                    }}
                    onMouseEnter={(e) => handleHoverWeapon(e, weapon)}
                    onMouseLeave={() => setHoverWeapon(false)}>
                    {hoverWeapon && selectedWeapon === weapon
                      && <span className="face-name" style={{ position: 'absolute' }}>{selectedWeapon[0]}</span>}
                    {console.log(containerSize, naturalSize)}
                  </div>
                ))}
            </div>
            <div className="right"></div>
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
