import { useContext, useState } from "react";
import { makeRequest } from "../../axios";
import "./changepassword.scss";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { NotificationContext } from "../../context/notificationContext";

const ChangePassword = ({ setOpenUpdate, user }) => {
  const [inputs, setInputs] = useState(
    {
      oldpass: "",
      newpass1: "",
      newpass2: "",
    }
  );
  const { showNotification } = useContext(NotificationContext)

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  };

  const queryClient = useQueryClient();
  const [err, setErr] = useState(null)


  const mutation = useMutation(
    async data => {
      const response = await makeRequest.put('/users/changePassword', data);
      return response.data;
    },
    {
      onError: error => {
        if (error.response && (error.response.status === 400 || error.response.status === 404)) {
          setErr = error.response.data
          console.error('Bad Request:', error);
          console.log(err)
        } else {
          setOpenUpdate(false)
          console.error('Error:', error);
        }
      }
    }
  );

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      await makeRequest.put('/users/changePassword', inputs).then(response => {
        setErr(response.data)
      })
      showNotification("Đổi mật khẩu thành công!!")
    } catch (err) {
      setErr(err.response.data)
      showNotification("Đổi mật khẩu thất bại. Vui lòng thử lại")
    }
  }

  return (
    <div className="update">
      <div className="wrapper">
        <label>Đổi mật khẩu</label>
        <label>Nhập mật khẩu hiện tại</label>
        <input
          type="password"
          name="oldpass"
          onChange={handleChange}
        />
        <label>Nhập mật khẩu mới</label>
        <input
          type="password"
          name="newpass1"
          onChange={handleChange}
        />
        <label>Nhập lại mật khẩu mới</label>
        <input
          type="password"
          name="newpass2"
          onChange={handleChange}
        />
        <span style={{ color: "red" }}>{err && err}</span>
        <button onClick={handleClick}>Change</button>
        <button className="close" onClick={() => setOpenUpdate(false)}>
          X Close
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;