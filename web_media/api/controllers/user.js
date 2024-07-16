import { db } from "../connect.js"
import bcrypt from "bcryptjs"
import exp from "constants"
import jwt from "jsonwebtoken"

export const getUser = (req, res) => {
    const token = req.cookies.accessToken
    if (!token) return res.status(401).json("Not logged in!")

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!")
        const userId = req.params.userId
        const q = "SELECT * FROM users WHERE id=?"
        console.log("id",userId)
        if (userId && userId!="undefined") {
            db.query(q, [userId], (err, data) => {
                if (err) return res.status(500).json(err)
                if (data.lenght === 0) return res.status(400).json("Not account!")
                const profile = {
                    id: data[0].id,
                    username: data[0].username,
                    name: data[0].name,
                    coverPic: data[0].coverPic,
                    profilePic: data[0].profilePic
                }
                if (userId === userInfo.id) {
                    try {
                        const { password, ...info } = data[0]
                        return res.json(info)
                    } catch (err) { return res.status(400).json("Not account!") }
                }
                if (data[0].privacyProfile === "private") {
                    return res.json(profile)
                } else if (data[0] === "friend") {
                    const q2 = `select pend from relationships where followerUserId=? and followedUserId=?`
                    db.query(q2, [userId, userInfo.id], (err, dataPend1) => {
                        if (dataPend1 && Object.keys(dataPend1).length > 0) {
                            if (dataPend1[0].pend === "true") {
                                const q3 = `select pend from relationships where followerUserId=? and followedUserId=?`
                                db.query(q3, [userInfo.id, userId], (err, dataPend2) => {
                                    if (dataPend2 && dataPend2[0].pend === "true") {
                                        try {
                                            const { password, ...info } = data[0]
                                            return res.json(info)
                                        } catch (err) { return res.status(400).json("Not account!") }
                                    } else { return res.json(profile) }
                                })
                            } else { return res.json(profile) }
                        } else { return res.json(profile) }
                    })

                } else if (data[0].privacyProfile === "follower") {
                    const q2 = `select pend from relationships where followerUserId=? and followedUserId=?`
                    db.query(q2, [userId, userInfo.id], (err, dataPend1) => {
                        console.log(dataPend1.lenght > 0)
                        if (dataPend1 && Object.keys(dataPend1).length > 0) {
                            if (dataPend1[0].pend === "true") {
                                try {
                                    const { password, ...info } = data[0]
                                    return res.json(info)
                                } catch (err) { return res.status(400).json("Not account!") }
                            } else { return res.json(profile) }
                        } else { return res.json(profile) }
                    })
                } else if (data[0].privacyProfile === "followed") {
                    const q2 = `select pend from relationships where followedUserId=? and followerUserId=?`
                    db.query(q2, [userId, userInfo.id], (err, dataPend1) => {
                        if (dataPend1 && Object.keys(dataPend1).length) {
                            if (dataPend1[0].pend === "true") {
                                try {
                                    const { password, ...info } = data[0]
                                    return res.json(info)
                                } catch (err) { return res.status(400).json("Not account!") }
                            } else { return res.json(profile) }
                        } else { return res.json(profile) }
                    })
                } else if (data[0].privacyProfile === "follow") {
                    const q2 = `select pend from relationships where (followedUserId=? and followerUserId=?) or (followedUserId=? and followerUserId=?)`
                    db.query(q2, [userId, userInfo.id, userInfo.id, userId], (err, dataPend1) => {
                        if (dataPend1 && Object.keys(dataPend1).length > 0) {
                            if (!dataPend1.some(data => data.pend === "false")) {
                                try {
                                    const { password, ...info } = data[0]
                                    return res.json(info)
                                } catch (err) { return res.status(400).json("Not account!") }
                            } else { return res.json(profile) }
                        } else { return res.json(profile) }
                    })
                } else {
                    try {
                        const { password, ...info } = data[0]
                        return res.json(info)
                    } catch (err) { return res.status(400).json("Not account!") }
                }
            })
        }
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

export const deleteUser = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not authenticated!");

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");
        if (userInfo.role === "admin") {
            const q = "DELETE FROM users WHERE `id`=?";
            db.query(q, [req.params.id], (err, data) => {
                if (err) return res.status(500).json(err);
                if (data.affectedRows > 0) return res.status(200).json("Xóa user thành công");
                return res.status(403).json("Bạn phải là admin để thực hiện việc này")
            });
        }
    });
};

export const privacyProfile = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not authenticated!");

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");
        const q =
            "UPDATE users SET `privacyProfile`=? WHERE id=? ";
        switch (req.body.privacyProfile) {
            case "public":
                break;
            case "private":
                break;
            case "friend":
                break;
            case "follower":
                break;
            case "followed":
                break;
            case "follow":
                break;
            default:
                console.log(typeof req.body.privacyProfile);
                return res.status(404).json("Tôi đã bắt được 1 thiên thần xâm nhập dữ liệu với ý đồ xấu");
        }
        db.query(q, [req.body.privacyProfile, userInfo.id], (err, data) => {
            if (err) res.status(500).json(err);
            return res.status(403).json("Successfull changed privacy profile!");
        }
        );
    });
};

export const privacyFollowed = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not authenticated!");

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");
        const q =
            "UPDATE users SET `pendingFollowed`=? WHERE id=? ";
        switch (req.body.privacyFollowed) {
            case "limit":
                break;
            case "public":
                break;
            default:
                return res.status(404).json("Tôi đã bắt được 1 thiên thần xâm nhập dữ liệu với ý đồ xấu");
        }
        db.query(q, [req.body.privacyFollowed, userInfo.id], (err, data) => {
            if (err) res.status(500).json(err);
            return res.status(403).json("Successfull changed privacy followed!");
        }
        );
    });
};
export const test = (req, res) => {
    const q2 = `Select privacyProfile from users where id=4`
    db.query(q2, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data[0].privacyProfile)
    })
}