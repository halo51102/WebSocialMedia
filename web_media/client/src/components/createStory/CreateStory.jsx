import { useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import "./createStory.scss"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const CreateStory = ({ setOpenCreate }) => {

    const [img, setImg] = useState(null);

    const upload = async () => {
        try {
            const formData = new FormData()
            formData.append("file", img)
            const res = await makeRequest.post("/upload", formData)
            return res.data
        } catch (err) {
            console.log(err)
        }
    }

    const queryClient = useQueryClient();

    const mutation = useMutation(
        (newStory) => {
            return makeRequest.post("/stories", newStory);
        },
        {
            onSuccess: () => {
                // Invalidate and refetch
                queryClient.invalidateQueries(["stories"]);
            },
        }
    );

    const handleNewStory = async (e) => {
        e.preventDefault();
        let imgUrl = ""
        if (img) imgUrl = await upload();

        mutation.mutate({ img: imgUrl })
        setOpenCreate(false);
        setImg(null);
    }

    return (
        <div className="create">
            <div className="wrapper">
                <h1>Add your story</h1>
                <form>
                    <div className="files">
                        <label htmlFor="image">
                            <span>Image</span>
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
                            onChange={(e) => setImg(e.target.files[0])}
                        />
                    </div>
                    <button onClick={handleNewStory}>Add</button>
                </form>
                <button className="close" onClick={() => setOpenCreate(false)}>
                    x
                </button>
            </div>
        </div>
    );
}

export default CreateStory;