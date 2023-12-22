import { db } from "../connect.js"
import jwt from "jsonwebtoken"
import moment from "moment";


export const addNotifications = (req, res) => {
    const token = req.cookies.accessToken
    if (!token) return res.status(401).json("Not logged in!")

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!")

        const q =
            "INSERT INTO notifications (`senderId`,`receiverId`,`type`,`create_at`) VALUES (?)";
        const values = [
            userInfo.id,
            req.body.receiverId,
            req.body.type,
            moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
        ]

        db.query(q, [values], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.status(200).json("Thêm thông báo thành công")
        })
    })
}

export const getNotifications = (req, res) => {
    const token = req.cookies.accessToken
    if (!token) return res.status(401).json("Not logged in!")

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!")

        const q = "select n.*,u.name from notifications as n join users as u on (n.senderId=u.id) where n.receiverId=? order by create_at DESC;"

        db.query(q, [req.query.receiverId], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.status(200).json(data)
        })
    })
}