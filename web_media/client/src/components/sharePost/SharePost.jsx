import { useContext, useState } from "react";
import { makeRequest } from "../../axios";
import "./sharepost.scss";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Link } from "react-router-dom";
import moment from "moment";
import { AuthContext } from "../../context/authContext";
import profileAlt from "../../assets/profileAlt.png"

const SharePost = ({ setShareOpen, postShare }) => {
    console.log(postShare)
    const { currentUser } = useContext(AuthContext);
    const [desc, setDesc] = useState("")
    const queryClient = useQueryClient()
    const { isLoading: fUserLoading, error: fUserError, data: findUser } = useQuery(["user"], () =>
        makeRequest.get("/users/find/" + currentUser.id).then((res) => {
            return res.data
        }))
    const mutation = useMutation((newPost) => {
        return makeRequest.post("/posts", newPost)
    },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["posts"])
            }
        })
    const handleShare = async (e) => {
        e.preventDefault()
        mutation.mutate({ desc, img: null, group: null, sharePost: postShare.id })
        setDesc("")
        setShareOpen(false)
    }

    return (
        <div className="sharing">
            <div className="wrapper">
                <div className="descSharing">
                    <div className="userShare">
                        <img
                            src={findUser?.profilePic ? "/upload/" + findUser?.profilePic : profileAlt}
                            alt=""
                        />
                        <span className="name">{findUser?.name}</span>
                    </div>
                    <input type="text" placeholder={`What's on your mind ${findUser?.name}?`}
                        onChange={(e) => setDesc(e.target.value)}
                        value={desc}
                    />
                </div>
                <div className="postSharing">

                    <div className="sharePost">
                        <div className="contentShare">
                            <img src={"/upload/" + postShare.img}
                                alt="" />
                        </div>

                        <div className="userInfoShare">
                            <img src={postShare.profilePic? "/upload/" + postShare.profilePic: profileAlt} alt="" />
                            <div className="detailShare">

                                <span className="nameShare">{postShare.name}</span>
                                <span className="dateShare">{moment(postShare.createdAt).fromNow()}</span>
                            </div>
                        </div>
                        <div className="contentShare">
                            <p>{postShare.desc}</p>
                        </div>
                    </div>
                </div>
                <button className="button-share" onClick={handleShare}>Share</button>
                <button className="close" onClick={() => setShareOpen(false)}>
                    X Close
                </button>
            </div>
        </div>
    );
};

export default SharePost;