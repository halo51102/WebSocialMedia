import "./share.scss";
import axios from "axios";
import ImageIcon from "../../assets/img.png";
import Map from "../../assets/map.png";
import Friend from "../../assets/friend.png";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { makeRequest } from "../../axios";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import profileAlt from "../../assets/profileAlt.png"
import { NotificationContext } from "../../context/notificationContext";
import { IoCloseCircle } from "react-icons/io5";
import { uploadImagesToS3 } from "../../s3.config";
import { IoMdWarning } from "react-icons/io";
import NewPost from "../newPost/NewPost";
import { LoadingOutlined } from "@ant-design/icons";
import { MdOutlineGppGood } from "react-icons/md";

const Share = () => {

  const [file, setFile] = useState([])
  const [desc, setDesc] = useState("")
  const [newPostData, setNewPostData] = useState(null);
  const groupId = parseInt(useLocation().pathname.split("/")[2])
  const { currentUser } = useContext(AuthContext)
  const queryClient = useQueryClient()
  const { showNotification } = useContext(NotificationContext)
  const [predict, setPredict] = useState('good');
  const [openImage, setOpenImage] = useState(false);
  const [image, setImage] = useState();
  const [isPosting, setIsPosting] = useState(false);
  const [weapons, setWeapons] = useState([]);
  const [isPredicting, setIsPredicting] = useState(false);


  const { isLoading, error, data: findUser } = useQuery(["user"], () =>
    makeRequest.get("/users/find/" + currentUser.id).then((res) => {
      return res.data
    }))

  const upload = async (postId, file) => {
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Accept'] = 'application/json';

    try {

      // const formData = new FormData()
      // formData.append("file", file)
      const res = await uploadImagesToS3(file)

      const formData = new FormData();
      formData.append("text", res);

      const predict = await axios.post("http://localhost:8003/predict", formData);
      console.log(predict)
      if (predict.data.results.length > 0) {
        const imgRes = await makeRequest.post("/posts/images", { postId: postId, img: res, isDangerous: 'true' })
        // await imagePostMutation.mutate(postId, res, 'true');
        // console.log(imgRes)
      } else {
        const imgRes = await makeRequest.post("/posts/images", { postId: postId, img: res, isDangerous: 'false' })
        // await imagePostMutation.mutate(postId, res, 'false');

        // console.log(imgRes)
      }

      console.log('đã up ảnh vô post')
    } catch (err) {
      console.log(err)
    }

  }

  const newPostMutation = useMutation(async (newPost) => {
    const res = await makeRequest.post("/posts", newPost)
    return res.data
  },
    {
      onSuccess: async (data) => {
        queryClient.invalidateQueries(["postsInGroup"]);
        queryClient.invalidateQueries(["imagesOfPost"]);

      }
    }
  )

  const imagePostMutation = useMutation(async (postId, img, isDangerous) => {
    const imgRes = await makeRequest.post("/posts/images", { postId: postId, img: img, isDangerous: isDangerous })
    return imgRes;
  },
    {
      onSuccess: async (data) => {
        queryClient.invalidateQueries(["postsInGroup"]);
        queryClient.invalidateQueries(["imagesOfPost"]);
      }
    }
  )

  const weapon_detect = async (file) => {
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Accept'] = 'application/json';
    console.log('detecting')
    const isDangerous = 'false';
    const formData = new FormData();
    formData.append("file", file);
    try {
      const r = await axios.post("http://localhost:8003/predict", formData);
      if (r.data.results.length > 0) {
        isDangerous = 'true';
      }
      console.log(isDangerous)
      return isDangerous;
    }
    catch (err) {
      showNotification('Lỗi server');
    }
  }

  const handleNewPost = async (e) => {
    console.log('in posting')
    setIsPosting(true);

    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Accept'] = 'application/json';
    e.preventDefault();

    try {
      // Check toxic
      const formData = new FormData();
      formData.append('text', desc);
      const prediction = await axios.post("http://127.0.0.1:8001/", formData);
      console.log(prediction.data.result);
      const result = prediction.data.result;
      console.log('đã check toxic')
      try {
        newPostMutation.mutateAsync({
          desc,
          group: groupId,
          sharePost: null,
        }).then(async (data) => {

          console.log('đã add post')

          await file.forEach(async (item) => {
            await upload(data.data.insertId, item);
          });

          if (result != '0') {
            const res = await makeRequest.put("/posts/report/" + data.data.insertId, { status: "bad" });
            console.log(res);
          }
        })
        setDesc("")
        setFile([])
        setIsPosting(false);
        setPredict('good');
        showNotification("Đăng bài viết thành công");
      }
      catch (err) {
        showNotification("Đăng bài viết thất bại!!")
      }
    }
    catch (err) {
      showNotification('Không thể phán đoán ngôn từ phản cảm');
    }
  }

  const handleChangeDesc = async (e) => {
    setIsPredicting(true);

    setDesc(e.target.value);
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Accept'] = 'application/json';
    try {
      const formData = new FormData();
      formData.append('text', e.target.value);
      const prediction = await axios.post("http://127.0.0.1:8001/", formData);

      const result = prediction.data.result;
      if (result != '0') {
        setPredict('bad');
      } else {
        setPredict('good');
      }

    } catch (err) {
      return
    }
    setIsPredicting(false);

  }

  const handleClickImage = async (item) => {
    setOpenImage(true);
  }

  const handleChooseImage = (item) => {
    const img = new Image();
    img.src = URL.createObjectURL(item);
    img.onload = () => {
      setImage({
        url: img.src,
        width: img.width,
        height: img.height,
      });
    };
  }

  const handleUploadFile = async (e) => {
    setFile((prevFiles) => [...prevFiles, (e.target.files[0])]);
    // const result = await weapon_detect(e.target.files[0]);
    // console.log(result);
  }

  console.log(file);

  return (
    <div className="share">
      {isPosting &&
        <div className="posting">
          <LoadingOutlined />
        </div>}
      <div className="container">
        <div className="top">
          <div className="left">
            <img
              src={findUser?.profilePic ? findUser?.profilePic : profileAlt}
              alt=""
            />
            <input type="text" placeholder={`Bạn đang nghĩ gì vậy ${findUser?.name}...`}
              onChange={handleChangeDesc}
              value={desc} />
            { }
            {isPredicting ?
              <div className="warning">
                <LoadingOutlined style={{ color: 'blue', marginRight: '5px', fontSize: '15px' }} />
                <span>Đang kiểm tra...</span>
              </div> :
              predict === 'bad' ?
                <div className="warning">
                  <IoMdWarning style={{ color: 'red', marginRight: '5px', fontSize: '15px' }} />
                  <span>Chứa ngôn từ phản cảm</span>
                </div> :
                desc !== "" &&
                <div className="warning">
                  <MdOutlineGppGood style={{ color: 'green', marginRight: '5px', fontSize: '15px' }} />
                  <span>Đoạn văn bình thường</span>
                </div>
            }
          </div>
          <div className="right">
            {file && (file?.map((item) => (
              <div className="file">
                <IoCloseCircle className="icon-remove" onClick={() => {
                  setFile((prevFiles) => prevFiles.filter((file) => file !== item));

                }} />
                <img className="file" alt="" src={URL.createObjectURL(item)} onClick={async () => await handleClickImage(item)} onMouseEnter={() => handleChooseImage(item)} />
              </div>)))}
            {/* {openImage
              && <div className="image-detail">
                <NewPost
                  images={file}
                  handleCloseImage={() => { setOpenImage(false) }} />
              </div>} */}
            {file.length !== 0 && <div className="file">
              <input type="file"
                id="file"
                style={{ display: "none" }}
                onChange={(e) => { handleUploadFile(e) }}
              />
              <label htmlFor="file">
                <img className="icon-add"
                  alt=""
                  src="https://th.bing.com/th/id/OIP.CKFK1fo-TcgXoWtsFJnzTgHaHa?w=202&h=202&c=7&r=0&o=5&dpr=1.3&pid=1.7"
                />
              </label>
            </div>}
          </div>
        </div>
        <hr />
        <div className="bottom">
          <div className="left">
            <input type="file"
              id="file"
              style={{ display: "none" }}
              onChange={(e) => { handleUploadFile(e); }}
              multiple />
            <label htmlFor="file">
              <div className="item">
                <img src={ImageIcon} alt="" />
                <span>Hình ảnh</span>
              </div>
            </label>
            <div className="item">
              <img src={Map} alt="" />
              <span>Địa điểm</span>
            </div>
            <div className="item">
              <img src={Friend} alt="" />
              <span>Gắn thẻ</span>
            </div>
          </div>
          <div className="right">
            <button onClick={handleNewPost}>Đăng</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Share;
