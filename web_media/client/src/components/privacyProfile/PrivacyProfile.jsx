import { useContext, useEffect, useRef, useState } from "react";
import { makeRequest } from "../../axios";
import "./privacyprofile.scss";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { NotificationContext } from "../../context/notificationContext";
import { AuthContext } from "../../context/authContext";

const PrivacyProfile = ({ setOpenPrivacy, currentUser }) => {
  const selectRef = useRef(null);
  const [privacyProfileValue, setprivacyProfileValue] = useState('');
  const [privacyPendValue, setprivacyPendValue] = useState('');
  const [err, setErr] = useState(null)
  useEffect(() => {
    const fetchData = async () => {
      setprivacyProfileValue(currentUser.privacyProfile)
      setprivacyPendValue(currentUser.pendingFollowed)
    };
    fetchData();
  }, [currentUser])

  const handleChange = async (event) => {
    setprivacyProfileValue(event.target.value);
    try {
      await makeRequest.put('/users/privacyProfile', { privacyProfile: event.target.value }).then(response => {
        setErr(response.data)
      })
      alert("Set privacy profile thành công")
    } catch (error) {
      setErr(error.response.data)
    }
  };
  const handleChangeFollow = async (event) => {
    setprivacyPendValue(event.target.value);
    try {
      await makeRequest.put('/users/privacyFollowed', { privacyFollowed: event.target.value }).then(response => {
        setErr(response.data)
      })
      alert("Set privacy follow thành công")
    } catch (error) {
      setErr(error.response.data)
    }
  };

  return (
    <div className="update">
      <div className="wrapper">
        <label>Quyền riêng tư</label>
        <div className="div-select">
          <label className="div-privacy" htmlFor="mySelect">Ai có thể thấy bài viết của bạn</label>
          <select className="div-option" id="mySelect" value={privacyProfileValue} onChange={handleChange}>
            <option value="public">Cộng đồng</option>
            <option value="private">Chỉ mình tôi</option>
            <option value="friend">Bạn bè</option>
            <option value="follower">Người theo dõi bạn</option>
            <option value="followed">Người bạn theo dõi</option>
            <option value="follow">Người có quan hệ theo dõi với bạn</option>
          </select>
        </div>
        <div className="div-select">
          <label className="div-privacy" htmlFor="mySelect">Phê duyệt người có thể theo dõi bạn</label>
          <select className="div-option" id="mySelect" value={privacyPendValue} onChange={handleChangeFollow}>
            <option value="public">Bật</option>
            <option value="limit">Tắt</option>
          </select>
        </div>
        <button className="close" onClick={() => setOpenPrivacy(false)}>
          X Close
        </button>
      </div>
    </div>
  );
};

export default PrivacyProfile;