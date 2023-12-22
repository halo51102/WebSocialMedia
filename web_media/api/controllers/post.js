import { db } from "../connect.js"
import jwt from "jsonwebtoken"

import moment from "moment";

export const getPosts = (req, res) => {

  const userId = req.query.userId
  const token = req.cookies.accessToken
  if (!token) return res.status(401).json("Not logged in!")

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!")

    const q = userId !== "undefined" ?
      `select p.*, u.username, u.name, u.profilePic, r.followedUserId, r.followerUserId from posts as p join users as u on(p.userId=u.id) left join relationships as r
    on (u.id=r.followedUserId) where r.followerUserId=?;`
      : `SELECT p.*,u.id AS userId,name,username,profilePic FROM posts AS p JOIN users AS u ON(u.id=p.userId)
    LEFT JOIN relationships AS r ON (p.userId=r.followedUserId) WHERE r.followerUserId=? OR p.userId=?
    ORDER BY p.createdAt DESC`


    const values = userId !== "undefined" ? [userId] : [userInfo.id, userInfo.id]
    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data)
    })
  })

}

export const getPostsInProfile = (req, res) => {

  const userId = req.query.userId
  const token = req.cookies.accessToken
  if (!token) return res.status(401).json("Not logged in!")

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!")

    const q = userId !== "undefined" ?
      `select p.*, u.username, u.name, u.profilePic from posts as p join users as u on(p.userId=u.id) where p.userId=?;`
      : `SELECT p.*,u.id AS userId,name,username,profilePic FROM posts AS p JOIN users AS u ON(u.id=p.userId)
    LEFT JOIN relationships AS r ON (p.userId=r.followedUserId) WHERE r.followerUserId=? OR p.userId=?
    ORDER BY p.createdAt DESC`


    const values = userId !== "undefined" ? [userId] : [userInfo.id, userInfo.id]
    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data)
    })
  })

}

export const addPost = (req, res) => {
  const token = req.cookies.accessToken
  if (!token) return res.status(401).json("Not logged in!")

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!")

    const q =
      "INSERT INTO posts(`desc`, `img`, `createdAt`, `userId`,`groupId`,`sharePostId`) VALUES (?)"
    const values = [
      req.body.desc,
      req.body.img,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
      req.body.group,
      req.body.sharePost
    ]

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err)
      return res.status(200).json("Post has been created.")
    })
  })
}
export const deletePost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");
  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    const q =
      "DELETE FROM posts WHERE `id`=? AND `userId` = ?";
    db.query(q, [req.params.id, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows > 0) return res.status(200).json("Post has been deleted.");
      return res.status(403).json("You can delete only your post")
    });
  });
};

export const deletePostInGroup = (req, res) => {
  ///posts/:id?userid=

  ///sáng code l
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");
  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    const admin = "admin"
    const q =
      "delete from posts where ?=(select position from membergroups where userId=? AND groupId=?) AND id=?";
    db.query(q, [admin, userInfo.id, req.params.groupId, req.params.id], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows > 0) return res.status(200).json("Post has been deleted.");
      return res.status(403).json("You can delete only your post")
    });
  });
};

export const getPostsInGroup = (req, res) => {

  const token = req.cookies.accessToken
  if (!token) return res.status(401).json("Not logged in!")

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!")

    const q = `SELECT p.*,u.id AS userId,u.name AS name,u.profilePic AS profilePic FROM posts AS p JOIN users AS u ON(u.id=p.userId)
    LEFT JOIN publicgroups AS g ON (p.groupId=g.id) WHERE g.id=?
    ORDER BY p.createdAt DESC`

    db.query(q, [req.params.groupId], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data)
    })
  })
}

export const countPosts = (req, res) => {
  const q = "SELECT count(id) as count FROM socialmedia.posts"

  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data[0].count)
  })
}