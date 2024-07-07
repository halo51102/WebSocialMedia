import "./share.scss";
import axios from "axios";
import Image from "../../assets/img.png";
import Map from "../../assets/map.png";
import Friend from "../../assets/friend.png";
import { useContext } from "react";
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

const Share = () => {

  const [file, setFile] = useState([])
  const [desc, setDesc] = useState("")
  const [newPostData, setNewPostData] = useState(null);
  const groupId = parseInt(useLocation().pathname.split("/")[2])
  const { currentUser } = useContext(AuthContext)
  const queryClient = useQueryClient()
  const { showNotification } = useContext(NotificationContext)
  const [predict, setPredict] = useState('good');

  const { isLoading, error, data: findUser } = useQuery(["user"], () =>
    makeRequest.get("/users/find/" + currentUser.id).then((res) => {
      return res.data
    }))

  const upload = async (postId, file) => {
    // const formData = new FormData()
    // formData.append("file", file)
    const res = await uploadImagesToS3(file)
    console.log(res)
    const imgRes = await makeRequest.post("/posts/images", { postId: postId, img: res })
    console.log(imgRes)
    return;
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

  const handleNewPost = async (e) => {
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Accept'] = 'application/json';

    e.preventDefault()

    try {
      newPostMutation.mutateAsync({
        desc,
        group: groupId,
        sharePost: null,
      }).then(async (data) => {
        await file.forEach(async (item) => {
          upload(data.data.insertId, item)
        }); //upload ảnh lên s3

        const formData = new FormData();
        formData.append('text', desc);
        const prediction = await axios.post("http://127.0.0.1:8001/", formData);
        console.log(prediction.data.result);
        const result = prediction.data.result;
        if (result != '0') {
          const res = await makeRequest.put("/posts/report/" + data.data.insertId, { status: "bad" });
          console.log(res);
        }
      }).then(async () => {
        showNotification("Đăng bài viết thành công!!")
      })
      setDesc("")
      setFile([])
    }
    catch (err) {
      showNotification("Đăng bài viết thất bại!!")
    }
  }

  const handleChangeDesc = async (e) => {
    setDesc(e.target.value);
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Accept'] = 'application/json';
    const formData = new FormData();
    formData.append('text', e.target.value);
    const prediction = await axios.post("http://127.0.0.1:8001/", formData);
    const result = prediction.data.result;
    if (result != '0') {
      setPredict('bad');
    } else {
      setPredict('good');
    }
  }

  return (
    <div className="share">
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
            {
            predict === 'bad' 
            && <div className="warning">
              <IoMdWarning style={{color: 'red', marginRight: '5px', fontSize: '15px'}}/>
              <span>Chứa ngôn từ phản cảm</span>
            </div>
            }
          </div>
          <div className="right">
            {file && (file?.map((item) => (
              <div className="file">
                <IoCloseCircle className="icon-remove" onClick={() => setFile((prevFiles) => prevFiles.filter((file) => file !== item))} />
                <img className="file" alt="" src={URL.createObjectURL(item)} />
              </div>)))}
            {file.length !== 0 && <div className="file">
              <input type="file"
                id="file"
                style={{ display: "none" }}
                onChange={(e) => setFile((prevFiles) => [...prevFiles, ...Array.from(e.target.files)])}
                multiple />
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
              onChange={(e) => setFile((prevFiles) => [...prevFiles, ...Array.from(e.target.files)])}
              multiple />
            <label htmlFor="file">
              <div className="item">
                <img src={Image} alt="" />
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
