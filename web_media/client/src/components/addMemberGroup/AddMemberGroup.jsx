import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import "./addmembergroup.scss";
import profileAlt from "../../assets/profileAlt.png"

export const AddMemberGroup = ({ results, groupId, membergroup }) => {
    console.log(results)
    let empty = []
    const { currentUser } = useContext(AuthContext)
    const navigate = useNavigate();
    const { isLoading, error, data } = useQuery(["membergroups"], () =>
        makeRequest.get("/groups/" + groupId + "/members").then((res) => {
            return res.data;
        })
    );
    const queryClient=useQueryClient()
    const addMemberMutation = useMutation((userId) => {
        return makeRequest.post("/groups/" + groupId + "/members/" + userId);
    },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["membergroups"])
            }
        }
    );
    const handleAdd=(userId)=>{
        addMemberMutation.mutate(userId)
    }
    console.log(data)
    return (
        <div className="results">

            {(results !== empty)
                ?
                results?.map((result, id) =>
                (result.id!==currentUser.id && !membergroup?.some(member=>member.userId===result.id) && <div className="aresult"><Link
                    to={"/profile/" + result.id}
                    style={{ textDecoration: "none", color: "inherit" }}
                >
                    {console.log(result.id)}
                    <div className="result" key={id} >
                        <div className="info">
                            <img
                                src={result?.profilePic?"/upload/" + result?.profilePic:profileAlt}
                                alt="" />
                            <span>{result.name}</span>
                        </div>

                        
                    </div>
                </Link>
                <button onClick={() => handleAdd(result.id)}>+Add</button>
                </div>)
                )

                :
                <div className="result"><span>Không có kết quả</span></div>
            }
        </div>
    );
};