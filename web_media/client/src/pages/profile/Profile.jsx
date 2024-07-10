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
import { useEffect } from "react";
import profileAlt from "../../assets/profileAlt.png"
import coverAlt from "../../assets/coverAlt.png"
import { MdOutlineImageNotSupported } from "react-icons/md";
import { FcNoVideo } from "react-icons/fc";

const Profile = ({ socket, user }) => {
  const [openUpdate, setOpenUpdate] = useState(false);
  const { currentUser } = useContext(AuthContext)
  const [showImage, setShowImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const userId = parseInt(useLocation().pathname.split("/")[2])
  const [openMedias, setOpenMedias] = useState('');
  const [selectedComponent, setSelectedComponent] = useState('');
  const [imagesData, setImagesData] = useState([]);
  const [videosData, setVideosData] = useState([]);

  const queryClient = useQueryClient();

  useEffect(() => {
    const getImagesOfUser = async () => {
      const res = await makeRequest.get("/posts/images-user?userId=" + userId);
      const images = res.data.filter(item => item.img.includes('jpg') || item.img.includes('png'))
      setImagesData(images);
      const videos = res.data.filter(item => item.img.includes('mp4'));
      setVideosData(videos);
    };
    getImagesOfUser();
  }, [])

  console.log(user)

  const { isLoading, error, data } = useQuery(["user", userId], () =>
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
        queryClient.invalidateQueries(["followed"])
        queryClient.invalidateQueries(["user"])
      }
    }
  );

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImage(true);
  }

  const handleImageClose = () => {
    setShowImage(false);
    setSelectedImage('');
  }

  const handleFollowClick = () => {
    // console.log("here")
    mutation.mutate(relationshipData.some(item => item.id === currentUser.id))
  }

  const handleClickImages = (e) => {
    setOpenMedias(openMedias === 'images' ? '' : 'images');
    setSelectedComponent(selectedComponent === 'images' ? '' : 'images');
  }
  console.log(selectedComponent)
  const handleClickVideos = (e) => {
    setOpenMedias(openMedias === 'videos' ? '' : 'videos');
    setSelectedComponent(selectedComponent === 'videos' ? '' : 'videos');
  }

  return (
    <div className="profile">
      {isLoading ? "loading" : <>
        <div className="images">
          <img
            src={data?.coverPic ? data?.coverPic : coverAlt}
            alt=""
            className="cover"
            onClick={() => handleImageClick(data?.coverPic ? data?.coverPic : coverAlt)}
          />
          <img
            src={data?.profilePic ? data?.profilePic : profileAlt}
            alt=""
            className="profilePic"
            onClick={() => handleImageClick(data?.profilePic ? data?.profilePic : profileAlt)}

          />
        </div>
        <div className="profileContainer">
          <div className="uInfo">
            <div className="left">
              {/*  */}
            </div>
            <div className="center">
              <span>{data?.name}</span>
              <div className="info">
                {
                  data?.city !== ''
                  && data?.city
                  && <div className="item">
                    <PlaceIcon />
                    <span>{data?.city}</span>
                  </div>
                }
                {
                  data?.website !== ''
                  && data?.website
                  && <div className="item">
                    <LanguageIcon />
                    <span>{data?.website}</span>
                  </div>
                }
              </div>
              {rIsLoading ? ("loading")
                : userId === currentUser.id ? (<button onClick={() => setOpenUpdate(true)}>Chỉnh sửa</button>)
                  : (<button onClick={handleFollowClick}>
                    {relationshipData.some(item => item.id === currentUser.id) ? "Hủy Theo dõi" : "Theo dõi"}
                  </button>)}
            </div>
            <div className="right">
              {/* <MoreVertIcon /> */}
            </div>
          </div>
          <div className="menu">
            <div className={`menu-item ${selectedComponent === 'images' ? 'selected' : ''}`} onClick={handleClickImages}>
              <p>Ảnh</p>
            </div>
            <div className={`menu-item ${selectedComponent === 'videos' ? 'selected' : ''}`} onClick={handleClickVideos}>
              <p>Video</p>
            </div>
          </div>
          {
            openMedias === ''
              ? <Posts userId={userId} whichPage={"profile"} socket={socket} user={user} />
              : openMedias === 'images'
                ? <div className="images">
                  {
                    imagesData.length === 0
                      ? <div className="empty">
                        <MdOutlineImageNotSupported className="icon" />
                        <p>Chưa có hình ảnh</p>
                      </div>
                      : imagesData?.map((item) => (
                        <div className="image">
                          <img src={item.img} alt="" style={{ width: '100px' }} />
                        </div>
                      ))
                  }
                </div>
                : <div className="images">
                  {
                    videosData.length === 0
                      ? <div className="empty">
                        <FcNoVideo className="icon" />
                        <p>Chưa có video</p>
                      </div>
                      : videosData?.map((item) => (
                        <div className="image">
                          <video width="100px" height="" controls>
                            <source src={item.img} type="video/mp4" />
                          </video>
                        </div>
                      ))
                  }
                </div>
          }
        </div>
      </>}
      {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={data} />}
      {showImage && (
        <div className="image-container">
          <img src={selectedImage} alt="" />
          <button onClick={handleImageClose}></button>
        </div>
      )}
    </div>

  );
};

export default Profile;
