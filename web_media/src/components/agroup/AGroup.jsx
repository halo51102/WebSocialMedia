import { useContext, useState } from "react";
import "./agroup.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery,useQueryClient} from "@tanstack/react-query";
import { useEffect } from 'react';
import { makeRequest } from "../../axios";
import { Link } from "react-router-dom";
const AGroup = ({ groupId }) => {

  const queryClient = useQueryClient();

  useEffect(() => {
    // Update 'agroup' value in the query cache when 'groupId' changes
    queryClient.setQueryData(['agroup'], groupId);
  }, [groupId, queryClient]);

  const { isLoading, error, data } = useQuery(['agroup'], () =>
    makeRequest.get("/groups/" + groupId).then((res) => {
      return res.data;
    })
  );
  console.log("ll")
  console.log(groupId)
  console.log(data)
  console.log("jj")
  return (
    <div className="comments">
      {error
        ? "Something went wrong"
        : isLoading
          ? "loading"
          :(
            <div className="comment">
              <img src={data.profilePic} alt="" />
              <div className="info">
                <Link to={`/group/${data.id}`}>
                  <span>{data.name}</span>
                </Link>
              </div>
            </div>
          )}
    </div>
  );
};
export default AGroup;