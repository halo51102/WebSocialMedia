import { useContext, useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import "./listTagPost.scss"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { NotificationContext } from "../../context/notificationContext";
import { Link } from "react-router-dom";

const ListTagPost = ({ setOpenTag, postId }) => {


    const{isLoading: tagIL,error:tagError,data:tagData}=useQuery(["userTagPost"],()=>
    makeRequest.get("/userTagPost?postId="+postId).then((res)=>{
      return res.data
    })
    )

    return (
        <div className="create">
            <div className="wrapper">
                <h1>List Tag</h1>
                <form>
                    <div>
                    {tagData?.map((userTag)=>
                    userTag.idpost===postId&&<Link
                    to={"/"}
                    style={{ textDecoration: "none", color: "inherit" }}>
                    <div>{userTag.userId}</div>
                    </Link>)}
                    </div>
                </form>
                <button className="close" onClick={() => setOpenTag(false)}>
                    x
                </button>
            </div>
        </div>
    );
}

export default ListTagPost;