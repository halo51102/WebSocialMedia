import "./userList.scss";
import { DataGrid } from "@mui/x-data-grid";
// import { userColumns, userRows } from "../../../datatablesource.js";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../../axios.js";

const UserList = () => {
  const [data, setData] = useState([]);
  const queryClient = useQueryClient();

  const userColumns = [
    { field: "id", headerName: "ID", width: 100 },
    {
      field: "name",
      headerName: "Tên",
      width: 250,
      renderCell: (params) => {
        return (
          <div className="cellWithImg">
            <img className="cellImg" src={"/upload/" + params.row.profilePic} alt="avatar" />
            {params.row.name}
          </div>
        );
      },
    },
    {
      field: "email",
      headerName: "Email",
      width: 300,
    },
  ];

  const { isLoading: pIdLoading, error: pError, data: pData } = useQuery(["allUsers"], async () =>
    await makeRequest.get("/users/").then((res) => {
      return res.data
    }))

  useEffect(() => {
    if (pData)
      setData(pData)
  }, [pData]);

  const deleteMutation = useMutation((userId) => {
    return makeRequest.delete("/users/" + userId);
  },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["allUsers"])
      }
    }
  );

  const handleDelete = (id) => {
    deleteMutation.mutate(id)
    // setData(data.filter((item) => item.id !== id));
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => {
        return (
          <div className="cellAction">
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
        Tài khoản
      </div>
      <DataGrid
        className="datagrid"
        rows={data}
        columns={userColumns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
      // checkboxSelection
      />
    </main>
  );
};

export default UserList;