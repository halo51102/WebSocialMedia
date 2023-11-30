import { useContext, useState } from "react";
import "./agroup.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery,useMutation,useQueryClient  } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import moment from "moment"
import { Link } from "react-router-dom";

const AGroup = ({groupId}) => {

const [desc,setDesc]=useState("")

  const { currentUser } = useContext(AuthContext);
  const { isLoading, error, data } = useQuery(["groups"], () =>
  makeRequest.get("/groups?id="+groupId).then((res) => {
    return res.data;
  })
);

  return (
    <div className="comments">
      {error
        ? "Something went wrong"
        : isLoading 
      ? "loading"
      : data.map((group) => (
        <div className="comment">
          <img src={group.profilePic} alt=""/>
          <div className="info">
            <Link to={`/group/${group.id}`}>
            <span>{group.name}</span>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AGroup;
