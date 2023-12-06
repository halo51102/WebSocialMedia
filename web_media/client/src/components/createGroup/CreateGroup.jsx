import { useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import "./createGroup.scss"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const CreateGroup = ({ setOpenCreate }) => {

    const [img, setImgPic] = useState(null);
    const [imgCover, setImgCover] = useState(null);
    const [name, setName] = useState("")
    const [desc, setDesc] = useState("")

    const upload = async (im) => {
        try {
            const formData = new FormData()
            formData.append("file", im)
            const res = await makeRequest.post("/upload", formData)
            return res.data
        } catch (err) {
            console.log(err)
        }
    }

    const queryClient = useQueryClient();

    const mutation = useMutation(
        (newGroup) => {
            return makeRequest.post("/groups", newGroup);
        },
        {
            onSuccess: () => {
                // Invalidate and refetch
                queryClient.invalidateQueries(["groups"]);
            },
        }
    );
    console.log(imgCover)
    console.log(name)
    const handleClick = async (e) => {
        e.preventDefault();
        let imgUrl = ""
        let imgCv = ""
        if (img) imgUrl = await upload(img);
        if (imgCover) imgCv = await upload(imgCover);
        console.log(imgCv)
        mutation.mutate({ profilePic: imgUrl, coverPic: imgCv, desc, name })
        setOpenCreate(false);
        setName("")
        setDesc("")
        setImgPic(null);
        setImgCover(null);
    }

    return (
        <div className="create">
            <div className="wrapper">
                <h1>Create New Group</h1>
                <form>
                    <div className="files">
                        <label htmlFor="image">
                            <span>Image Profile</span>
                            <div className="imgContainer">
                                <img
                                    src={img ? URL.createObjectURL(img) : "No image"}
                                    alt=""
                                />
                                <CloudUploadIcon className="icon" />
                            </div>
                        </label>
                        <input
                            type="file"
                            id="image"
                            style={{ display: "none" }}
                            onChange={(e) => setImgPic(e.target.files[0])}
                        />
                        <label htmlFor="cover">
                            <span>Image Cover</span>
                            <div className="imgContainer">
                                <img
                                    src={imgCover ? URL.createObjectURL(imgCover) : "No image"}
                                    alt=""
                                />
                                <CloudUploadIcon className="icon" />
                            </div>
                        </label>
                        <input
                            type="file"
                            id="cover"
                            style={{ display: "none" }}
                            onChange={(e) => setImgCover(e.target.files[0])}
                        />

                    </div>
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                    />
                    <label>Describe</label>
                    <input
                        type="text"
                        name="desc"
                        onChange={(e) => setDesc(e.target.value)}
                        value={desc}
                    />
                    <button onClick={handleClick}>Add</button>
                </form>
                <button className="close" onClick={() => setOpenCreate(false)}>
                    x
                </button>
            </div>
        </div>
    );
}

export default CreateGroup;