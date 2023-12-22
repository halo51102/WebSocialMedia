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
  const { currentUser } = useContext(AuthContext);
  const [showStory, setShowStory] = useState(false);
  const [selectedStory, setSelectedStory] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const { isLoading, error, data } = useQuery(["stories"], () =>
    makeRequest.get("/stories/all").then((res) => {
      return res.data;
    })
  );

  const { isLoading: fUserLoading, error: fUserError, data: findUser } = useQuery(["user"], () =>
    makeRequest.get("/users/find/" + currentUser.id).then((res) => {
      return res.data
    }))

  const { error: getStoryError, data: storyData } = useQuery(["story", selectedStory], () =>
    makeRequest.get("/stories?userId=" + selectedStory.userId).then((res) => {
      return res.data;
    })
  );
  const queryClient = useQueryClient()

  const watchStoryMutation = useMutation((userId) => {
    return makeRequest.get("/stories?userId=" + userId);
  },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["stories"])
      }
    }
  );

  const storyMutation = useMutation((clickedStory) => {
    return makeRequest.get("/stories?userId=" + clickedStory.userId);
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries(["story"]);
    }
  })

  const handleClickStory = async (story) => {
    const res = await makeRequest.get("/stories?userId=" + story.userId)
    console.log(res)
    setSelectedStory(res.data);
    setShowStory(true);
  }

  const handleCloseStory = () => {
    setShowStory(false);
    setCurrentStoryIndex(0);
  }

  const handleNextStory = () => {
    if (currentStoryIndex < selectedStory.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    }
  };

  const handlePreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  const filteredData = [];
  const userIdSet = new Set();

  data?.forEach(item => {
    if (!userIdSet.has(item.userId)) {
      userIdSet.add(item.userId);
      filteredData.push(item);
    }
  });

  console.log(currentStoryIndex)
  const handleClick = () => {

  }

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
            : filteredData.map((story) => (
              <div className="story" >
                <img src={story.img ? "/upload/" + story.img : profileAlt} alt="" onClick={() => handleClickStory(story)} />
                <span>{story.name}</span>
              </div>
            ))
      }

      {showStory
        && <div className="story-container">
          <div className="story-view">
            {/* {storyData?.map((item) =>
              <img src={"/upload/" + item.img} alt="" />
            )} */}
            <img src={"/upload/" + selectedStory[currentStoryIndex].img} alt="" />
          </div>
          <button onClick={handleCloseStory}>X</button>

          {selectedStory.length > 1
            && <div className="button-slide">
              {(currentStoryIndex !== 0)
                && <button className="button-left" onClick={handlePreviousStory}>←</button>}
              {(currentStoryIndex !== (selectedStory.length - 1))
                && <button className="button-right" onClick={handleNextStory}>→</button>}
            </div>}

        </div>
      }
    </div>
  )
}

export default Stories