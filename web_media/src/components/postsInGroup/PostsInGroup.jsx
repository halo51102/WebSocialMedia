import Post from "../post/Post";
import "./postsingroup.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const PostsInGroup = ({groupId}) => {

    const { isLoading, error, data } = useQuery(["posts"], () =>
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
          : data.map((post) => <Post post={post} key={post.id} />)}
      </div>
    );
  };
  
  export default PostsInGroup;