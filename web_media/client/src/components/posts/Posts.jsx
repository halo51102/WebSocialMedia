import Post from "../post/Post";
import "./posts.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useState } from "react";

const Posts = ({ userId, socket, user, whichPage }) => {

  const [commentOpen, setCommentOpen] = useState(null);

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
  console.log(pData)

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
              />)
      }
    </div>
  );
};


export default Posts;