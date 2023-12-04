import { db } from "../connect.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import moment from "moment"

export const getGroup = (req, res) => {
    const groupId = req.params.groupId
    const q = "SELECT * FROM publicgroups WHERE id=?"

    db.query(q, [groupId], (err, data) => {
        if (err) return res.status(500).json(err)
        return res.json(data[0])
    })
}

export const getAllGroup=(req,res)=>{
    const q="SELECT * FROM publicgroups"
    db.query(q,(err,data)=>{
        if(err) return res.status(500).json(err)
        return res.status(200).json(data)
    })
}

export const addGroup = (req, res) => {
    const token = req.cookies.accessToken
    if (!token) return res.status(401).json("Not logged in!")

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!")
        const q = "INSERT INTO publicgroups (`name`,`desc`,`coverPic`,`profilePic`,`createdUserId`,`createdAt`) VALUE (?)"
        const values = [
            req.body.name,
            req.body.desc,
            req.body.coverPic,
            req.body.profilePic,
            userInfo.id,
            moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
        ]
        db.query(q, [values], (err, data) => {
            if (err) return res.status(500).json(err)
            const sl = "SELECT * FROM publicgroups ORDER BY id DESC LIMIT 1"
            db.query(sl, (err, data_groupId) => {
                if (err) return res.status(500).json(err)
                if (data_groupId.length > 0) {
                    const groupId = data_groupId[1]
                    const q =
                        "INSERT INTO membergroups (`groupId`,`userId`,`position`,`createdJion`) VALUES (?)";
                    const values = [
                        data_groupId.map(group=>group.id),
                        userInfo.id,
                        "admin",
                        moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                    ]
                    db.query(q, [values], (err, data) => {
                        if (err) return res.status(500).json(err)
                        return res.status(200).json("Group has been created")
                    })
                }
            })
        })
    })
}

export const deleteGroup = (req, res) => {

}


export const getMemberGroup = (req, res) => {
    const q = `SELECT m.*, u.id AS userId, name, profilePic FROM membergroups AS m JOIN users AS u ON (u.id = m.userId)
    WHERE m.groupId = ?`

    db.query(q, [req.params.groupId], (err, data) => {
        if (err) return res.status(500).json(err)
        return res.status(200).json(data)
    })
}

export const joinGroup = (req, res) => {
    const token = req.cookies.accessToken
    if (!token) return res.status(401).json("Not logged in!")

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!")

        const q =
            "INSERT INTO membergroups (`groupId`,`userId`,`position`,`createdJion`) VALUES (?)";
        const values = [
            req.params.groupId,
            userInfo.id,
            "member",
            moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
        ]

        db.query(q, [values], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.status(200).json("You joined in group.")
        })
    })
}

export const outGroup = (req, res) => {
    const token = req.cookies.accessToken
    if (!token) return res.status(401).json("Not logged in!")

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!")

        const q =
            "DELETE FROM membergroups WHERE `userId` = ? AND `groupId` = ?";

        db.query(q, [userInfo.id, req.params.groupId], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.status(200).json("You out group.")
        })
    })
}