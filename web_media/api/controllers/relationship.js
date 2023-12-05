import { db } from "../connect.js"
import jwt from "jsonwebtoken"

export const getRelationship = (req, res) => {

    const q = "SELECT id, username, profilePic, name FROM users WHERE users.id IN (SELECT followerUserId FROM relationships WHERE followedUserId =?)"
    db.query(q, [req.query.followedUserId], (err, data) => {
        if (err) return res.status(500).json(err)
        return res.status(200).json(data)
    })
}

export const getFollowEd = (req, res) => {

    const q = "SELECT id, username, profilePic, name FROM users WHERE users.id IN (SELECT followedUserId FROM relationships WHERE followerUserId =?)"
    db.query(q, [req.query.followerUserId], (err, data) => {
        if (err) return res.status(500).json(err)
        return res.status(200).json(data)
    })
}

export const deleteRelationship = (req, res) => {
    const token = req.cookies.accessToken
    if (!token) return res.status(401).json("Not logged in!")

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!")

        const q =
            "DELETE FROM relationships WHERE `followerUserId` = ? AND `followedUserId` = ?";

        db.query(q, [userInfo.id, req.query.userId], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.status(200).json("Unfollow")
        })
    })
}

export const addRelationship = (req, res) => {
    const token = req.cookies.accessToken
    if (!token) return res.status(401).json("Not logged in!")

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!")

        const q =
            "INSERT INTO relationships (`followerUserId`,`followedUserId`) VALUES (?)";
        const values = [
            userInfo.id,
            req.body.userId
        ]

        db.query(q, [values], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.status(200).json("Following")
        })
    })
}

export const suggestFollow=(req,res)=>{
    const token = req.cookies.accessToken
    if (!token) return res.status(401).json("Not logged in!")

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!")

        const q =
            "SELECT u.* FROM users as u, relationships as r WHERE u.id!=? and r.followerUserId=? and r.followedUserId!=u.id order by rand() LIMIT 2";

        db.query(q, [userInfo.id, userInfo.id], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.status(200).json(data)
        })
    })
}