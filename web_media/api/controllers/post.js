import { db } from "../connect.js"
import jwt from "jsonwebtoken"
import moment from "moment";
import makeRequest from "axios";

export const getPosts = (req, res) => {

  const userId = req.query.userId
  const token = req.cookies.accessToken
  if (!token) return res.status(401).json("Not logged in!")

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!")

    const q = userId !== "undefined" ?
      `select p.*, u.username, u.name, u.profilePic, r.followedUserId, r.followerUserId from posts as p join users as u on(p.userId=u.id) left join relationships as r
    on (u.id=r.followedUserId) where r.followerUserId=? ORDER BY p.createdAt DESC;`
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
      `select p.*, u.username, u.name, u.profilePic from posts as p join users as u on(p.userId=u.id) where p.userId=? ORDER BY p.createdAt DESC;`
      : `SELECT p.*,u.id AS userId,name,username,profilePic FROM posts AS p JOIN users AS u ON(u.id=p.userId)
    LEFT JOIN relationships AS r ON (p.userId=r.followedUserId) WHERE r.followerUserId=? OR p.userId=?
    ORDER BY p.createdAt DESC`

    const values = userId !== "undefined" ? [userId] : [userInfo.id, userInfo.id]

    if (userId === userInfo.id) {
      db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data)
      })
    } else {
      if (userId) {
        const q0 = `Select privacyProfile from users where id=?`

        db.query(q0, [userId], (err, data) => {
          if (err) return res.status(500).json(err)
          if (data.lenght === 0) return res.status(400).json("Not account!")
          console.log(data)
          if (data[0].privacyProfile === "private") {
            return res.status(400).json("Privacy")
          } else if (data[0] === "friend") {
            const q2 = `select pend from relationships where followerUserId=? and followedUserId=?`
            db.query(q2, [userId, userInfo.id], (err, dataPend1) => {
              if (dataPend1 && Object.keys(dataPend1).length > 0) {
                if (dataPend1[0].pend === "true") {
                  const q3 = `select pend from relationships where followerUserId=? and followedUserId=?`
                  db.query(q3, [userInfo.id, userId], (err, dataPend2) => {
                    if (dataPend2 && dataPend2[0].pend === "true") {
                      db.query(q, values, (err, data) => {
                        if (err) return res.status(500).json(err);
                        return res.status(200).json(data)
                      })
                    } res.status(400).json("Privacy")
                  })
                } res.status(400).json("Privacy")
              } res.status(400).json("Privacy")
            })

          } else if (data[0].privacyProfile === "follower") {
            const q2 = `select pend from relationships where followerUserId=? and followedUserId=?`
            db.query(q2, [userId, userInfo.id], (err, dataPend1) => {
              console.log(dataPend1.lenght > 0)
              if (dataPend1 && Object.keys(dataPend1).length > 0) {
                if (dataPend1[0].pend === "true") {
                  db.query(q, values, (err, data) => {
                    if (err) return res.status(500).json(err);
                    return res.status(200).json(data)
                  })
                } else res.status(400).json("Privacy")
              } else res.status(400).json("Privacy")
            })
          } else if (data[0].privacyProfile === "followed") {
            const q2 = `select pend from relationships where followedUserId=? and followerUserId=?`
            db.query(q2, [userId, userInfo.id], (err, dataPend1) => {
              if (dataPend1 && Object.keys(dataPend1).length) {
                if (dataPend1[0].pend === "true") {
                  db.query(q, values, (err, data) => {
                    if (err) return res.status(500).json(err);
                    return res.status(200).json(data)
                  })
                } else res.status(400).json("Privacy")
              } else res.status(400).json("Privacy")
            })
          } else if (data[0].privacyProfile === "follow") {
            const q2 = `select pend from relationships where (followedUserId=? and followerUserId=?) or (followedUserId=? and followerUserId=?)`
            db.query(q2, [userId, userInfo.id, userInfo.id, userId], (err, dataPend1) => {
              if (dataPend1 && Object.keys(dataPend1).length > 0) {
                if (!dataPend1.some(data => data.pend === "false")) {
                  db.query(q, values, (err, data) => {
                    if (err) return res.status(500).json(err);
                    return res.status(200).json(data)
                  })
                } else res.status(400).json("Privacy")
              } else res.status(400).json("Privacy")
            })
          } else {
            db.query(q, values, (err, data) => {
              if (err) return res.status(500).json(err);
              return res.status(200).json(data)
            })
          }
        })
      }
    }

  })

}

// export const addPost = (req, res) => {
//   const token = req.cookies.accessToken
//   if (!token) return res.status(401).json("Not logged in!")

//   jwt.verify(token, "secretkey", (err, userInfo) => {
//     if (err) return res.status(403).json("Token is not valid!")

//     const q =
//       "INSERT INTO posts(`desc`, `img`, `createdAt`, `userId`,`groupId`,`sharePostId`) VALUES (?)"
//     const values = [
//       req.body.desc,
//       req.body.img,
//       moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
//       userInfo.id,
//       req.body.group,
//       req.body.sharePost
//     ]

//     db.query(q, [values], (err, data) => {
//       if (err) return res.status(500).json(err)
//       return res.status(200).json("Post has been created.")
//     })
//   })
// }

export const addPost = (req, res) => {
  const token = req.cookies.accessToken
  if (!token) return res.status(401).json("Not logged in!")

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");


    const q =
      "INSERT INTO posts(`desc`, `createdAt`, `userId`,`groupId`,`sharePostId`) VALUES (?)"
    const values = [
      req.body.desc,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
      req.body.group,
      req.body.sharePost
    ]

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err)
      return res.status(200).json({
        msg: "Post has been created.",
        data: data
      })
    })
  })
}

export const deletePost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");
  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    const q = (userInfo.role !== "admin")
      ? "DELETE FROM posts WHERE `id`=? AND `userId` = ?"
      : "DELETE FROM posts WHERE `id`=?";
    db.query(q, (userInfo.role !== "admin") ? [req.params.id, userInfo.id] : [req.params.id], (err, data) => {
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
  const q = "SELECT count(id) as count FROM posts"

  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data[0].count)
  })
}

export const getAllPosts = (req, res) => {
  const q = "SELECT p.*,u.profilePic as userProfilePic,u.name as userName, g.name as groupName, g.profilePic as groupProfilePic FROM posts as p join users as u on (p.userId=u.id) left join publicgroups as g on (g.id=p.groupId);"

  db.query(q, (err, data) => {
    if (err) return resd.status(500).json(err);
    return res.status(200).json(data)
  })
}

export const getAPost = (req, res) => {
  const token = req.cookies.accessToken
  if (!token) return res.status(401).json("Not logged in!")

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!")

    const q = `SELECT p.*,u.username, u.name, u.profilePic FROM posts AS p JOIN users AS u ON(p.userId=u.id) WHERE p.id=?`

    db.query(q, [req.params.postId], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data)
    })
  })
}

export const updateReportStatus = (req, res) => {
  const token = req.cookies.accessToken
  if (!token) return res.status(401).json("Not logged in!")

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!")

    const q =
      "UPDATE posts SET `status` = ? where `id` = ? "
    const values = [
      req.body.status,
      req.params.postId
    ]

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err)
      return res.status(200).json("Post has been reported")
    })
  })
}

export const getImagesOfPost = (req, res) => {
  const q = `SELECT pi.* FROM posts AS p JOIN posts_images AS pi ON (p.id=pi.postId) WHERE p.id=?`

  db.query(q, [req.query.postId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data)
  })
}

export const getImagesOfUser = (req, res) => {
  const q = `SELECT pi.* FROM posts AS p JOIN posts_images AS pi ON (p.id=pi.postId) WHERE p.userId=? order by postId asc;`

  db.query(q, [req.query.userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data)
  })
}

export const addImageOfPost = (req, res) => {
  const token = req.cookies.accessToken
  if (!token) return res.status(401).json("Not logged in!")

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!")

    const q =
      "INSERT INTO posts_images(`postId`, `img`) VALUES (?)"
    const values = [
      req.body.postId,
      req.body.img
    ]

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err)
      return res.status(200).json({ msg: "Image of post has been created.", data: data })
    })
  })
}

export const checkToxicStatus = (req, res) => {
  const postId = req.body.postId;
  db.query("select * from posts where id = ?", [postId], async (err, data) => {
    if (err) return res.status(500).json("không tìm thấy posst");
    const post = data[0];
    const text = post.desc;
    const formData = new FormData();
    formData.append('text', text);
    try {
      const prediction = await makeRequest.post("https://localhost:8001/", formData);
      const result = prediction.data.result;
      if (result == '0') {
        return res.status(200).json(result);
      } else {
        db.query("update posts set status = 'bad' where id = ?", [postId], (err1, data1) => {
          if (err) return res.status(500).json("lỗi update post");
          return res.status(200).json(result);
        })
      }
    } catch (err) {
      return res.status(500).json("lỗi link predict")
    }
  })
};

