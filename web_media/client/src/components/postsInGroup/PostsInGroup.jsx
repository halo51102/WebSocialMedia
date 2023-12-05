import Post from "../post/Post";
import "./postsingroup.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useState } from "react";

const PostsInGroup = ({groupId,socket,user}) => {
  const [commentOpen, setCommentOpen] = useState(null);

    const { isLoading, error, data } = useQuery(["postsInGroup"], () =>
      makeRequest.get("/posts/groups/"+groupId).then((res) => {
        return res.data;
      })
    );
  
    return (
      <div className="posts">
        {error
          ? "Something went wrong!"
          : isLoading
          ? "loading"
          : data.map((post) => <Post post={post}
          key={post.id}
          isCommentOpen={commentOpen === post.id}
          openComment={() => setCommentOpen(post.id)}
          closeComment={() => setCommentOpen(null)}
          socket={socket}
          user={user}/>)}
      </div>
    );
  };
  
  export default PostsInGroup;