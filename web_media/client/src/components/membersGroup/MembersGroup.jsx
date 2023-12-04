import { useContext, useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import "./membersGroup.scss"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import { Link } from "@mui/material";
import { useNavigate } from "react-router-dom";

const CreateGroup = ({ setOpenMember, groupId }) => {

    const { currentUser } = useContext(AuthContext)
    const queryClient = useQueryClient()
    const { isLoading, error, data } = useQuery(["membergroups"], () =>
        makeRequest.get("/groups/" + groupId + "/members").then((res) => {
            return res.data;
        })
    );
    const navigate = useNavigate();

    const deleteMemberMutation = useMutation((userId) => {
        return makeRequest.delete("/groups/" + groupId+"/members/"+userId);
      },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(["membergroups"])
          }
        }
      );

      const handleDelete = (userId) => {
        deleteMemberMutation.mutate(userId)
      }


    return (
        <div className="member">
            <div className="wrapper">
                <h1>Members In Group</h1>
                <div className="userlist">
                    {isLoading ? "loading"
                        : data.map((member, id) => (
                            <div className="memberInfo">
                                <Link
                                    style={{ textDecoration: "none" }}
                                    to={"/profile/" + member.userId}
                                    onClick={() => {
                                        navigate("/profile/" + member.userId, { replace: true });
                                        window.location.reload();
                                    }}
                                >
                                    <div className="user" key={id}>
                                        <div className="userInfo">
                                            <img
                                                src={"/upload/" + member.profilePic}
                                                alt=""
                                            />
                                            <span>{member.name}</span>
                                        </div>
                                    </div>
                                </Link>
                                {data.some(member => member.position === "admin"&& member.userId===currentUser.id && member.groupId===groupId) &&<button onClick={()=>handleDelete(member.userId)} >- Delete</button>}
                            </div>
                        )

                        )
                    }
                </div>
                <button className="close" onClick={() => setOpenMember(false)}>
                    x
                </button>
            </div>
        </div>
    );
}

export default CreateGroup;