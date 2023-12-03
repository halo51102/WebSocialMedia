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

    const handleClick = async (e) => {
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
                        {/* <label htmlFor="profile">
                            <span>Profile Picture</span>
                            <div className="imgContainer">
                                <img
                                    src={
                                        profile
                                            ? URL.createObjectURL(profile)
                                            : "/upload/" + user.profilePic
                                    }
                                    alt=""
                                />
                                <CloudUploadIcon className="icon" />
                            </div>
                        </label>
                        <input
                            type="file"
                            id="profile"
                            style={{ display: "none" }}
                            onChange={(e) => setProfile(e.target.files[0])}
                        /> */}
                    </div>
                    {/* <label>Email</label>
                    <input
                        type="text"
                        value={texts.email}
                        name="email"
                        onChange={handleChange}
                    />
                    <label>Password</label>
                    <input
                        type="text"
                        value={texts.password}
                        name="password"
                        onChange={handleChange}
                    />
                    <label>Name</label>
                    <input
                        type="text"
                        value={texts.name}
                        name="name"
                        onChange={handleChange}
                    />
                    <label>Country / City</label>
                    <input
                        type="text"
                        name="city"
                        value={texts.city}
                        onChange={handleChange}
                    />
                    <label>Website</label>
                    <input
                        type="text"
                        name="website"
                        value={texts.website}
                        onChange={handleChange}
                    /> */}
                    <button onClick={handleClick}>Add</button>
                </form>
                <button className="close" onClick={() => setOpenCreate(false)}>
                    x
                </button>
            </div>
        </div>
    );
}

export default CreateStory;