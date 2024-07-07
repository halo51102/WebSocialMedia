import { useContext, useState } from "react";
import "./comments.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import moment from "moment"
import axios from "axios";
import profileAlt from "../../assets/profileAlt.png"

const Comments = ({ postId, socket, user, post }) => {
  const [desc, setDesc] = useState("")

  const { currentUser } = useContext(AuthContext);
  const { isLoading, error, data: comments } = useQuery(["comments"], () =>
    makeRequest.get("/comments?postId=" + postId).then((res) => {
      return res.data;
    })
  );

  const queryClient = useQueryClient()

  const mutation = useMutation((newComment) => {
    return makeRequest.post("/comments", newComment)
  },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["comments"])
      }
    })

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

  const handleComment = async (e) => {
    e.preventDefault();

    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Accept'] = 'application/json';

    const formData = new FormData();
    formData.append('text', desc);
    const prediction = await axios.post("http://127.0.0.1:8001/", formData);
    const result = prediction.data.result;
    const text = "WebSocialMedia đã che bình luận vì ngôn từ phản cảm...";
    if (result != '0')
      mutation.mutate({ desc : text, postId });
    else
      mutation.mutate({ desc, postId });
    setDesc("")
    handleNotification(3);
    notificationMutation.mutate("bình luận")
  }

  const handleNotification = (type) => {
    socket?.emit("sendNotification", {
      senderName: user,
      receiverName: post.username,
      type,
    });
  };

  return (
    <div className="comments">
      <div className="write">
        <img src={currentUser?.profilePic ? currentUser?.profilePic : profileAlt} alt="" />
        <input type="text" placeholder="write a comment" value={desc} onChange={e => setDesc(e.target.value)} />
        <button onClick={handleComment}>Đăng</button>
      </div>
      <p>{comments?.length} bình luận</p>
      {error
        ? "Something went wrong"
        : isLoading
          ? "loading"
          : comments?.map((comment) => (
            <div className="comment" key={comment.id}>
              <img src={comment?.profilePic ? comment?.profilePic :  profileAlt} alt="" />
              <div className="info">
                <span>{comment.name}</span>
                <p>{comment.desc}</p>
              </div>
              <span className="date">{moment(comment.createdAt).fromNow()}</span>
            </div>
          ))}
    </div>
  );
};

export default Comments;
