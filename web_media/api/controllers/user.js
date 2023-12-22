import { db } from "../connect.js"
import bcrypt from "bcryptjs"
import exp from "constants"
import jwt from "jsonwebtoken"

export const getUser = (req, res) => {
    const userId = req.params.userId
    const q = "SELECT * FROM users WHERE id=?"

    db.query(q, [userId], (err, data) => {
        if (err) return res.status(500).json(err)
        const { password, ...info } = data[0]
        return res.json(info)
    })
}

export const getUserByPostId = (req, res) => {
    const q = "SELECT distinct username from users as u join posts as p on(p.userId=u.id) where p.id=?"

    db.query(q, [req.params.postId], (err, data) => {
        if (err) return res.status(500).json(err)
        return res.json(data.map(user => user.username))
    })
}

export const updateUser = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not authenticated!");

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const q =
            "UPDATE users SET `name`=?,`city`=?,`website`=?,`coverPic`=?,`profilePic`=? WHERE id=? ";

        db.query(
            q,
            [
                req.body.name,
                req.body.city,
                req.body.website,
                req.body.coverPic,
                req.body.profilePic,
                userInfo.id,
            ],
            (err, data) => {
                if (err) res.status(500).json(err);
                if (data.affectedRows > 0) return res.json("Updated!");
                return res.status(403).json("You can update only your post!");
            }
        );
    });
};

export const getAllUsers = (req, res) => {
    const q = "SELECT * FROM users where role='user'"

    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err)
        return res.json(data)
    })
}

export const changePasswordUser = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not authenticated!");

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");
        const q = "SELECT * FROM users WHERE id=?"
        db.query(q, [userInfo.id], (err, data) => {
            const checkPassword = bcrypt.compareSync(req.body.oldpass, data[0].password)
            if (!checkPassword) return res.status(400).json("Wrong password!")
            if (req.body.newpass1 !== req.body.newpass2 || req.body.newpass1 === "" || req.body.newpass1 === null) return res.status(404).json("Unsuccessful!")

            const q =
                "UPDATE users SET `password`=? WHERE id=? ";
            const salt = bcrypt.genSaltSync(10)
            const hashedPassword = bcrypt.hashSync(req.body.newpass2, salt)
            db.query(
                q,
                [
                    hashedPassword,
                    userInfo.id,
                ],
                (err, data) => {
                    if (err) res.status(500).json(err);
                    return res.status(200).json("Successful changed password!");
                }
            );
        });
    })
}

export const countUsers = (req, res) => {
    const q = "SELECT count(id) as count FROM socialmedia.users where role='user'"

    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data[0].count)
    })
}
