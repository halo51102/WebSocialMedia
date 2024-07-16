import { db } from "../connect.js"
import jwt from "jsonwebtoken"

export const getRelationship = (req, res) => {

    const q = "SELECT id, username, profilePic, name FROM users WHERE users.id IN (SELECT followerUserId FROM relationships WHERE followedUserId =? and pend=?)"
    db.query(q, [req.query.followedUserId, "true"], (err, data) => {
        if (err) return res.status(500).json(err)
        return res.status(200).json(data)
    })
}

export const getFollowEd = (req, res) => {

    const q = "SELECT id, username, profilePic, name FROM users WHERE users.id IN (SELECT followedUserId FROM relationships WHERE followerUserId =? and pend=?)"
    db.query(q, [req.query.followerUserId, "true"], (err, data) => {
        if (err) return res.status(500).json(err)
        return res.status(200).json(data)
    })
}
export const getPending = (req, res) => {
    const token = req.cookies.accessToken
    if (!token) return res.status(401).json("Not logged in!")

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!")

        const q = "SELECT id, username, profilePic, name FROM users WHERE users.id IN (SELECT followerUserId FROM relationships WHERE followedUserId =? and pend=?)"
        db.query(q, [userInfo.id, "false"], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.status(200).json(data)
        })
    })
}
export const getPended = (req, res) => {
    const token = req.cookies.accessToken
    if (!token) return res.status(401).json("Not logged in!")

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!")

        const q = "SELECT id, username, profilePic, name FROM users WHERE users.id IN (SELECT followedUserId FROM relationships WHERE followerUserId =? and pend=?)"
        db.query(q, [userInfo.id, "false"], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.status(200).json(data)
        })
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
export const rejectFollowed = (req, res) => {
    const token = req.cookies.accessToken
    if (!token) return res.status(401).json("Not logged in!")

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!")

        const q =
            "DELETE FROM relationships WHERE `followerUserId` = ? AND `followedUserId` = ?";

        db.query(q, [req.query.userId, userInfo.id], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.status(200).json("Reject Follow")
        })
    })
}

export const addRelationship = (req, res) => {
    const token = req.cookies.accessToken
    if (!token) return res.status(401).json("Not logged in!")

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!")

        const qb = "SELECT pendingFollowed from users where id=?"
        if (req.body.userId) {
            db.query(qb, [req.body.userId], (err, data) => {
                if (err) return res.status(500).json(err)
                console.log(data)
                const q =
                    "INSERT INTO relationships (`followerUserId`,`followedUserId`,`pend`) VALUES (?)";
                if (data[0].pendingFollowed == "public") {
                    const values = [
                        userInfo.id,
                        req.body.userId,
                        "true"
                    ]

                    db.query(q, [values], (err, data) => {
                        if (err) return res.status(500).json(err)
                        return res.status(200).json("Following")
                    })
                } else {
                    const values = [
                        userInfo.id,
                        req.body.userId,
                        "false"
                    ]

                    db.query(q, [values], (err, data) => {
                        if (err) return res.status(500).json(err)
                        return res.status(200).json("Pending")
                    })
                }
            })
        }

    })
}

export const suggestFollow = (req, res) => {
    // const userId = req.body.userId;
    const token = req.cookies.accessToken
    if (!token) return res.status(401).json("Not logged in!")

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");
        const userId = userInfo.id;
        const q =
            "select * from users where id in (SELECT r.followedUserId FROM socialmedia.users as u join relationships as r on u.id = r.followerUserId where u.id in (SELECT r.followedUserId FROM socialmedia.users as u join relationships as r on u.id = r.followerUserId where u.id = ?) and r.followedUserId != ? and r.followedUserId not in (SELECT r.followedUserId FROM socialmedia.users as u join relationships as r on u.id = r.followerUserId where u.id = ?))";
        db.query(q, [userId, userId, userId], (err, data) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json(data);
        })
    })
}

export const whoFollow = (req, res) => {
    const token = req.cookies.accessToken;
    const followedUserId = req.query.followedUserId;

    if (!token) return res.status(401).json("Not logged in!");

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(500).json(err);
        db.query("select * from users where id in (select r.followedUserId from users as u join relationships as r on u.id = r.followerUserId where r.followerUserId = ?) and id in (select r.followerUserId from users as u join relationships as r on u.id = r.followedUserId where r.followedUserId = ?)",
            [userInfo.id, followedUserId], (err0, data0) => {
                if (err0) return res.status(400).json(err0);
                return res.status(200).json(data0);
            });
    });
}

export const acceptFollowed = (req, res) => {
    const token = req.cookies.accessToken
    if (!token) return res.status(401).json("Not logged in!")

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!")
        var pend = "false"
        switch (req.body.pend) {
            case 0:
                pend = "false"
                break;
            case 1:
                pend = "true"
                break;
            default:
                return res.status(404).json("Tôi đã bắt được 1 thiên thần xâm nhập dữ liệu với ý đồ xấu");
        }
        const q =
            `UPDATE relationships SET pend=? WHERE followedUserId=? and followerUserId=?`;

        db.query(q, [pend, userInfo.id, req.body.followedUserId], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.status(200).json("Succsessfull accept user followed")
        })
    })
}
























