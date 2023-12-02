import "./allgroup.scss";
import { useQuery} from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import AGroup from "../../components/agroup/AGroup";

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
          <img src={group.profilePic} alt="" />
          <div className="info">
            <Link to={`/group/${group.id}`}>
              <span>{group.name}</span>
            </Link>
          </div>
        </div>))}
  </div>
);
};

export default AllGroup;
