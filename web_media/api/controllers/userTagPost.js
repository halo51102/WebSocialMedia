import { db } from "../connect.js"
import jwt from "jsonwebtoken"


import moment from "moment";

export const getAllUserTagPost = (req, res) => {

  const userId = req.query.userId
  const token = req.cookies.accessToken
  if (!token) return res.status(401).json("Not logged in!")

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!")

    const q =
      `select * from tagofpost where idpost=?`
    db.query(q, [req.query.postId], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data)
    })
  })
}

export const add = (req, res) => {

  const {postId, userId} = req.body;
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!")

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!")

    const q =
      `insert into tagofpost (idpost, userId) values(?);`
    db.query(q, [postId, userId], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data)
    })
  })
}