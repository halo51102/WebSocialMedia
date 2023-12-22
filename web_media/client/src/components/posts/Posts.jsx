import Post from "../post/Post";
import "./posts.scss";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useEffect, useState } from "react";

const Posts = ({ userId, socket, user, whichPage }) => {

  const [commentOpen, setCommentOpen] = useState(null);
  const [finalData, setFinalData] = useState([])

  const queryClient = useQueryClient();

  //Load post trong home
  const { isLoading, error, data } = useQuery(["posts", userId], () =>
    makeRequest.get("/posts?userId=" + userId).then((res) => {
      return res.data;
    })
  );

  //Load post trong profile
  const { isLoading: pIsLoading, error: pError, data: pData } = useQuery(["post", userId], () =>
    makeRequest.get("/posts/profile?userId=" + userId).then((res) => {
      return res.data;
    })
  );

  const fetchData = () => {
    makeRequest.get("/posts?userId=" + userId).then((res) => {
      setFinalData(res.d)
    })
  }



  return (
    <div className="posts">
      {error
        ? "Something went wrong!"
        : isLoading
          ? "loading"
          : (whichPage === "home")
            ? data?.map((post) =>
              <Post
                post={post}
                key={post.id}
                isCommentOpen={commentOpen === post.id}
                openComment={() => setCommentOpen(post.id)}
                closeComment={() => setCommentOpen(null)}
                socket={socket}
                user={user}
                whichPage={whichPage}
                fetchData={fetchData}
              />)
            : pData?.map((post) =>
              <Post
                post={post}
                key={post.id}
                isCommentOpen={commentOpen === post.id}
                openComment={() => setCommentOpen(post.id)}
                closeComment={() => setCommentOpen(null)}
                socket={socket}
                user={user}
                whichPage={whichPage}
                fetchData={fetchData}
              />)
      }

      {
        (whichPage === "home")
        && pData?.map((post) =>
          <Post
            post={post}
            key={post.id}
            isCommentOpen={commentOpen === post.id}
            openComment={() => setCommentOpen(post.id)}
            closeComment={() => setCommentOpen(null)}
            socket={socket}
            user={user}
            whichPage={whichPage}
            fetchData={fetchData}
          />)
      }
    </div>
  );
};


export default Posts;