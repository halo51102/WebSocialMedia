import { useContext, useState } from "react";
import "./agroup.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import moment from "moment"
import { Link } from "react-router-dom";
const AGroup = ({ groupId }) => {
  const [desc, setDesc] = useState("")
  const { currentUser } = useContext(AuthContext);
  const { isLoading, error, data } = useQuery(["groups"], () =>
    makeRequest.get("/groups/" + groupId).then((res) => {
      return res.data[0];
    })
  );
  console.log(data[0].id)
  return (
    <div className="comments">
      {error
        ? "Something went wrong"
        : isLoading
          ? "loading"
          :(
            <div className="comment">
              <img src={data[0].profilePic} alt="" />
              <div className="info">
                <Link to={`/group/${data[0].id}`}>
                  <span>{data[0].name}</span>
                </Link>
              </div>
            </div>
          )}
    </div>
  );
};
export default AGroup;