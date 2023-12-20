import { useContext } from "react";
import "./stories.scss"
import { AuthContext } from "../../context/authContext"
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CreateStory from "../createStory/CreateStory";
import profileAlt from "../../assets/profileAlt.png"

const Stories = () => {

  const [openCreate, setOpenCreate] = useState(false);

  const { currentUser } = useContext(AuthContext)

  const { isLoading, error, data } = useQuery(["stories"], () =>
    makeRequest.get("/stories").then((res) => {
      return res.data;
    })
  );

  const { isLoading: fUserLoading, error: fUserError, data: findUser } = useQuery(["user"], () =>
    makeRequest.get("/users/find/" + currentUser.id).then((res) => {
      return res.data
    }))

  const queryClient = useQueryClient()

  const mutation = useMutation((newStory) => {
    return makeRequest.post("/stories", newStory);
  },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["stories"])
      }
    }
  );

  // const handleCreate = async (e) => {
  //   e.preventDefault();

  //   let imgUrl = upload(img);

  //   mutation.mutate({ img: imgUrl })
  //   setImg(null);
  // }

  return (
    <div className="stories">
      <div className="story">
        <img src={findUser?.profilePic ? "/upload/" + findUser?.profilePic : profileAlt} alt="" />
        <span>{findUser?.name}</span>
        <button onClick={() => setOpenCreate(true)}>+</button>
      </div>
      {openCreate && <CreateStory setOpenCreate={setOpenCreate} />}

      {error
        ? "Không thể load dữ liệu"
        : isLoading
          ? "Đang tải..." 
          : !data ? (
            <div className="story-empty">
                Bạn đã xem hết story
            </div>
          )
          : data.map((story) => (
            <div className="story" key={story.id}>
              <img src={story.img ? "/upload/" + story.img : profileAlt} alt="" />
              <span>{story.name}</span>
            </div>
          ))
      }
    </div>
  )
}

export default Stories