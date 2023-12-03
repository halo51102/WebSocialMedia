import Post from "../post/Post";
import "./posts.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useState } from "react";

const Posts = ({ userId }) => {

  const [commentOpen, setCommentOpen] = useState(null);

  const { isLoading, error, data } = useQuery(["posts"], () =>
    makeRequest.get("/posts?userId=" + userId).then((res) => {
      return res.data;
    })
  );
  return (
    <div className="posts">
      {error
        ? "Something went wrong!"
        : isLoading
          ? "loading"
          : data.map((post) =>
            <Post
              post={post}
              key={post.id}
              isCommentOpen={commentOpen === post.id}
              openComment={() => setCommentOpen(post.id)}
              closeComment={() => setCommentOpen(null)}
            />)}
    </div>
  );
};


export default Posts;