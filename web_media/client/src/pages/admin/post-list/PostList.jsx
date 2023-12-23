import "./postList.scss";
import { DataGrid } from "@mui/x-data-grid";
// import { userColumns, userRows } from "../../../datatablesource.js";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../../axios.js";
import moment from "moment"

const PostList = () => {
  const [data, setData] = useState([]);
  const queryClient = useQueryClient();
  const [showPost, setShowPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const userColumns = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "desc",
      headerName: "Nội dung",
      width: 300,
    },
    {
      field: "createdAt",
      headerName: "Ngày tạo",
      width: 250,
    },
    {
      field: "",
      headerName: "Người tạo",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellWithImg">
            <img className="cellImg" src={"/upload/" + params.row.userProfilePic} alt="avatar" />
            {params.row.userName}
          </div>
        );
      },
    },
    {
      field: "userId",
      headerName: "Đăng trong group",
      width: 200,
      renderCell: (params) => {
        return (
          params.row.groupName && <div className="cellWithImg">
            <img className="cellImg" src={"/upload/" + params.row.groupProfilePic} alt="avatar" />
            {params.row.groupName}
          </div>
        );
      },
    },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 160,
      renderCell: (params) => {
        return (
          <div className={`cellWithStatus ${params.row.status}`}>
            {params.row.status}
          </div>
        );
      },
    },

  ];

  const { isLoading: pIdLoading, error: pError, data: pData } = useQuery(["allPosts"], async () =>
    await makeRequest.get("/posts/all").then((res) => {
      return res.data
    }))

  useEffect(() => {
    if (pData)
      setData(pData)
  }, [pData]);

  const deleteMutation = useMutation((postId) => {
    return makeRequest.delete("/posts/" + postId);
  },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["post"])
        queryClient.invalidateQueries(["postsInGroup"])
        queryClient.invalidateQueries(["allPosts"])
      }
    }
  );
  
  const handleDelete = (id) => {
    deleteMutation.mutate(id);
    // setData(data.filter((item) => item.id !== id));
  };

  const handleView = (postDataRow) => {
    setShowPost(true);
    console.log(postDataRow)
    setSelectedPost(postDataRow);
  }

  const handleCloseView = () => {
    setShowPost(false);
    setSelectedPost(null);
  }

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <div className="viewButton" onClick={() => handleView(params.row)}>View</div>

            <div
              className="deleteButton"
              onClick={() => handleDelete(params.row.id)}
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <main className="datatable">
      <div className="datatableTitle">
        Bài viết
      </div>
      <DataGrid
        className="datagrid"
        rows={data}
        columns={userColumns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
      />

      {
        showPost && <div className="view-container" onClick={handleCloseView}>
          <div className="view">
            <div className="user">
              <div className="userInfo">
                <img src={"/upload/" + selectedPost.userProfilePic} alt="" />
                <div className="details">

                  <span className="name">{selectedPost.userName}</span>

                  <span className="date">{moment(selectedPost.createdAt).fromNow()}</span>
                </div>
              </div>
            </div>

            <div className="content">
              <p>{selectedPost.desc}</p>
              <img src={"/upload/" + selectedPost.img}
                alt=""
              />
            </div>
          </div>
        </div>
      }
    </main>
  );
};

export default PostList;