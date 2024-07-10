import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import "./newPost.css"

const NewPost = ({ images, handleCloseImage, }) => {
  const [tagSession, setTagSession] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  // const { url, width, height } = image;
  const [image, setImage] = useState();
  const [faces, setFaces] = useState([]);
  const [friends, setFriends] = useState([]);

  const imgRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const img = new Image();
    img.src = URL.createObjectURL(images[selectedIndex]);
    img.onload = () => {
      setImage({
        url: img.src,
        width: img.width,
        height: img.height,
      });
    }
  }, [selectedIndex])

  const handleImage = async () => {
    const detections = await faceapi.detectAllFaces(
      imgRef.current,
      new faceapi.TinyFaceDetectorOptions()
    );

    setFaces(detections.map((d) => Object.values(d.box)));
  };

  const enter = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineWidth = 3;
    ctx.strokeStyle = "white";
    faces.map((face) => ctx.strokeRect(...face));
  };

  useEffect(() => {
    const loadModels = () => {
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      ])
        .then(handleImage)
        .catch((e) => console.log(e));
    };
    imgRef.current && loadModels();
  }, [selectedIndex]);

  const addFriend = (e) => {
    // setImage((others) => ({...others, face: face}))
    setFriends((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePreviosImage = () => {
    setSelectedIndex(selectedIndex - 1);

  }

  const handleNextImage = () => {
    setSelectedIndex(selectedIndex + 1);

  }
  console.log(faces);
  return (
    <div className="container-new-post">
      <div className="cnp-left" style={{ width: `${image?.width}`, height: `${image?.height}` }}>
        <img ref={imgRef} crossOrigin="anonymous" src={image?.url} alt="" />
        {/* <canvas
          onMouseEnter={enter}
          ref={canvasRef}
          width={image?.width}
          height={image?.height}
        /> */}
        {selectedIndex >= 1
          && <button className="imageButton" style={{ left: 0 }} onClick={handlePreviosImage}>{`<`}</button>
        }
        {selectedIndex < images?.length - 1 
        && <button className='imageButton' style={{ right: 0 }} onClick={handleNextImage}>{`>`}</button>}
        {faces.map((face, i) => (
          <div style={{position: 'absolute',left: face[0],top:face[1],width:face[2],height:face[3]}}>
            
          </div>
        ))}
        {faces.map((face, i) => (
          <input
            name={`input${i}`}
            style={{ left: face[0], top: face[1] + face[3] + 5 }}
            placeholder="Gắn thẻ"
            key={i}
            className="friendInput"
            onChange={addFriend}
          />
        ))}
      </div>
      <div className="cnp-right">
        <button className="cnp-rightButton cnp-closeButton" onClick={handleCloseImage}>x</button>
        <h1>Đăng bài viết</h1>
        <input
          type="text"
          placeholder="Bạn đang muốn nói điều gì?..."
          className="rightInput"
        />
        {friends && (
          <span className="cnp-friends">
            cùng với <span className="name">{Object.values(friends) + " "}</span>
          </span>
        )}
        <button className="cnp-rightButton">Đăng</button>

      </div>
    </div>
      );
};

      export default NewPost;
