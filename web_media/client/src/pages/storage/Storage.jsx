import "./storage.scss";
import coverAlt from "../../assets/coverAlt.png"
import ItemStorage from "../../components/itemStorage/ItemStorage";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const Storage = ({ socket }) => {
  const [storageData, setStorageData] = useState([]);

  const { currentUser } = useContext(AuthContext);

  const getData = async () => {
    const res = await makeRequest.get("/storage");
    setStorageData(res.data)
  }

  const storage = useMutation(() => {
    return makeRequest.get("/storage");
  },
    {
      onSuccess: () => {
        useQueryClient.invalidateQueries(["myStorage"])
      }
    }
  )

  const { isLoading, error, data } = useQuery(["myStorage"], () =>
    makeRequest.get("/storage").then((res) => {
      setStorageData(res.data);
      return res.data;
    })
  );
  return (
    <div className="storage">

      <div className="imagestorage">
        <img
          src={coverAlt}
          alt=""
          className="coverstorage"
        />
      </div>
      <div className="storageContainer">
        <div className="centerStr">
          <div className="infoStr">
            <span>Saved Posts</span>
          </div>

        </div>
      </div>
      <div>
        {error
          ? "Something went wrong!"
          : isLoading
            ? "loading"
            : storageData?.map((post) =>
              <ItemStorage postId={post.idpost} key={post.id} callback={getData} />)
        }
      </div>
    </div>
  );
};

export default Storage;
