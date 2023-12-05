import Post from "../post/Post";
import "./postsingroup.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const PostsInGroup = ({groupId,socket,user}) => {

    const { isLoading, error, data } = useQuery(["postsInGroup"], () =>
      makeRequest.get("/posts/groups/"+groupId).then((res) => {
        return res.data;
      })
    );
    console.log(data)
    console.log("id là "+ groupId)
  
    return (
      <div className="posts">
        {error
          ? "Something went wrong!"
          : isLoading
          ? "loading"
          : data.map((post) => <Post post={post}
          key={post.id}
          socket={socket}
          user={user}/>)}
      </div>
    );
  };
  
  export default PostsInGroup;