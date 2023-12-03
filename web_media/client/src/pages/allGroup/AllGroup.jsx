import "./allgroup.scss";
import { useQuery} from "@tanstack/react-query";
import { makeRequest } from "../../axios";

import { Link } from "react-router-dom";
const AllGroup = () => {
  const { isLoading, error, data } = useQuery(["groups"], () =>
  makeRequest.get("/groups/").then((res) => {
    return res.data;
  })
);
console.log(data)
return (
  <div className="comments">
    {error
      ? "Something went wrong!"
      : isLoading
        ? "loading"
        : data.map((group) => (
          <div className="comment">
          <img src={"/upload/"+group.profilePic} alt="" />
          <div className="info">
            <Link to={`/group/${group.id}`} style={{ textDecoration: "none", marginTop: "5px" }}>
              <span>{group.name}</span>
            </Link>
            <div className="desc">
            <span>{group.desc}</span>
            </div>
          </div>
        </div>))}
  </div>
);
};

export default AllGroup;
