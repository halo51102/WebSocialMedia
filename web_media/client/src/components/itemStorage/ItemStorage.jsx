import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import profileAlt from "../../assets/profileAlt.png"
import "./itemstorage.scss"
import { makeRequest } from "../../axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authContext";

import { NotificationContext } from "../../context/notificationContext";
const ItemStorage = ({ postId, callback }) => {


    const { currentUser } = useContext(AuthContext);

    const [menuOpen, setMenuOpen] = useState(false)

    const queryClient = useQueryClient()
    const { showNotification } = useContext(NotificationContext)
    const { isLoading: isL, error: er, data: pic } = useQuery(["imagesInPost", postId], () =>
        makeRequest.get("/posts/images?postId=" + postId).then((res) => {
            return res.data[0];
        })
    );
    const { isLoading, error, data } = useQuery(["postStorage", postId, currentUser.id], () =>
        makeRequest.get("/posts/s/" + postId).then((res) => {
            return res.data[0];
        })
    );
    const { data: userPost } = useQuery(["users"], () =>
    makeRequest.get("/users/find/" + data?.userId).then((res) => {
            return res.data[0];
        })
    );
    
    const removeSaveMutation = useMutation(() => {
        return makeRequest.delete("/storage/remove?postId=" + postId);
    },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["postStorage", postId, currentUser.id])
                queryClient.invalidateQueries(["myStorage"])
            }
        }
    )
    const handleRemoveSave = async () => {
        await removeSaveMutation.mutate();
        await callback();
        setMenuOpen(false);
        showNotification("Bài viết đã được xóa ra khỏi mục đã lưu.")
    }
    useEffect(() => {

    },)
    console.log(postId)
    return (
        <div >
            {error
                ? "Something went wrong!"
                : isLoading
                    ? "loading"
                    : data &&
                    <div className="postStorage">
                        <Link
                            to="/storage"
                            style={{ textDecoration: "none", color: "inherit" }}>
                            <div className="containerStorage">
                                <div className="itemPost">
                                    <img className="imgPost1" src={pic?.img ? pic?.img : profileAlt} alt="" />
                                    <div className="descStorage">
                                        <span className="descPost">{data?.desc}</span>
                                        {data?.userId === currentUser.id ? <span className="userPost">Được đăng bởi chính tôi</span> :
                                            <span className="userPost">Được đăng bởi {userPost?.name}</span>}
                                    </div>
                                </div>

                            </div>
                        </Link>

                        <div className="option-itemStorage"
                            onClick={() => {
                                setMenuOpen(!menuOpen);
                            }}>
                            <MoreHorizIcon />
                            {menuOpen
                                &&
                                <div className="button-option-itemStorage"
                                    onClick={() => {
                                        setMenuOpen(!menuOpen);
                                    }}
                                    style={{ background: 'lightgray', borderRadius: '50%', position: 'absolute', top: 0, left: 0 }}
                                >
                                    <MoreHorizIcon />
                                </div>
                            }
                            {menuOpen && <div className="post-storage-menu">
                                <span onClick={handleRemoveSave}>Bỏ lưu bài viết</span>
                            </div>}
                        </div>




                    </div>
            }
        </div >
    );
};

export default ItemStorage;
