import { useContext, useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import "./membersGroup.scss"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import { Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AddMemberGroup } from "../addMemberGroup/AddMemberGroup";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

const CreateGroup = ({ setOpenMember, groupId }) => {
    const [results, setResults] = useState([]);
    
  const [input, setInput] = useState("");
    const { currentUser } = useContext(AuthContext)
    const queryClient = useQueryClient()
    const { isLoading, error, data } = useQuery(["membergroups"], () =>
        makeRequest.get("/groups/" + groupId + "/members").then((res) => {
            return res.data;
        })
    );
    const navigate = useNavigate();

    const deleteMemberMutation = useMutation((userId) => {
        return makeRequest.delete("/groups/" + groupId + "/members/" + userId);
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
    const handleChange = (value) => {
        setInput(value);
        fetchData(value);
      };
    const fetchData = (value) => {
        fetch("http://localhost:8800/api/users")
          .then((response) => response.json())
          .then((json) => {
            const results = json.filter((user) => {
              return (
                value &&
                user &&
                user.name &&
                user.name.toLowerCase().includes(value) &&
                user.username.toLowerCase().includes(value)
              );
            });
            setResults(results);
            console.log(results)
          });
      };

    return (
        <div className="member">
            <div className="wrapper">
                <h1>Members In Group</h1>
                <div className="search-container">
                    <div className="search">
                        <SearchOutlinedIcon />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            onChange={(e) => handleChange(e.target.value)}
                        />
                    </div>
                </div>
                {results && results.length > 0 && <AddMemberGroup results={results} groupId={groupId} membergroup={data}/>}
                <div className="userlist">
                    {isLoading ? "loading"
                        : data?.map((member, id) => (
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
                                {data?.some(member => member.position === "admin" && member.userId === currentUser.id && member.groupId === groupId) && member.position !== "admin" && <button onClick={() => handleDelete(member.userId)} >- Delete</button>}
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