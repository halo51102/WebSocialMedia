import { db } from "../connect.js"
import jwt from "jsonwebtoken"

import moment from "moment"

export const getStoragePosts = (req, res) => {

  const token = req.cookies.accessToken
  if (!token) return res.status(401).json("Not logged in!")

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!")

    const q = `select * from storage where userId=?`

    db.query(q, [userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data)
    })
  })

}

export const addStoragePosts = (req, res) => {

  const postId = req.query.postId
  const token = req.cookies.accessToken
  if (!token) return res.status(401).json("Not logged in!")

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!")
    const q = "INSERT INTO storage(`userId`, `idpost`,`createdAt`) VALUES (?)";
    const value = [
      userInfo.id,
      postId,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    ]

    db.query(q, [value], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data)
    })
  })

}

export const removeStoragePosts = (req, res) => {

  const postId = req.query.postId
  const token = req.cookies.accessToken
  if (!token) return res.status(401).json("Not logged in!")

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!")
    const q = "DELETE FROM storage WHERE userId = ? AND idpost = ?";
    db.query(q, [userInfo.id, postId], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data)
    })
  })

}
