import "./allgroup.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { Link, useNavigate } from "react-router-dom";
import CreateGroup from "../../components/createGroup/CreateGroup";
import { useState, useContext } from "react";
import { AuthContext } from "../../context/authContext";
const AllGroup = () => {

  const { currentUser } = useContext(AuthContext)
  const [openCreate, setOpenCreate] = useState(false);

  const { isLoading: JisLoading, error: Jerror, data: Jdata } = useQuery(["groups"], () =>
    makeRequest.get("/groups/").then((res) => {
      return res.data;
    })
  );
  const { isLoading, error, data } = useQuery(["groupsJoined"], () =>
    makeRequest.get("/groups/myjoin").then((res) => {
      return res.data;
    })
  );
  console.log(Jdata)

  const navigate = useNavigate();
  return (
    <div className="group">
      <div className="container">
        <button onClick={() => setOpenCreate(true)}>+ Tạo group</button>
        {openCreate && <CreateGroup setOpenCreate={setOpenCreate} />}
        <div class="textgroup">
          <span>Các nhóm đã tham gia</span>
        </div>
        <div class="joinedgroup">
          {isLoading ? "loading"
            : data.map((group) =>
              <Link to={`/group/${group.id}`}>
                <img src={"/upload/" + group.profilePic} alt="" />
              </Link>)
          }
        </div>
        <div class="textgroup">
          <span>Các nhóm có thể tham gia</span>
        </div>
        <div className="allgroup">
          {Jerror
            ? "Something went wrong!"
            : JisLoading
              ? "loading"
              : Jdata?.map((agroup) => (
                (data && Array.isArray(data)&&!data.some(item => item.id === agroup.id)) && (<div className="comment">
                  <img src={"/upload/" + agroup.profilePic} alt="" />
                  <div className="info">
                    <Link to={`/group/${agroup.id}`} style={{ textDecoration: "none", marginTop: "5px" }}
                      onClick={() => {
                        navigate("/group/" + agroup.id, { replace: true });
                        window.location.reload();
                      }}>
                      <span>{agroup.name}</span>
                    </Link>
                    <div className="desc">
                      <span>{agroup.desc}</span>
                    </div>
                  </div>
                </div>)))}
        </div>
      </div>

    </div>
  );
};

export default AllGroup;
