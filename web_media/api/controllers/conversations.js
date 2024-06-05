import { db } from "../connect.js"
import jwt from "jsonwebtoken"

export const createConversation = (req, res) => {
    const q1 = "INSERT INTO conversations(`name`) VALUES (?)"
    const values = [
        req.body.name
    ]
    const q2 = "INSERT INTO conversation_members(`conversationId`, `userId`) VALUES ?"
    // const values2 = [

    // ]
    db.query(q1, [values], (err, data) => {
        if (err) return res.status(500).json(err)
        const conversationId = data.insertId
        // db.query(q2, [[[conversationId, req.body.senderId], [conversationId, req.body.receiverId]]], (err2, data2) => {
        //     if (err2) return res.status(500).json(err2)
        //     return res.status(200).json({"conversationId": conversationId})
        // })
        // Check if receiverId is an array or single value
        let receiverIds = Array.isArray(req.body.receiverId) ? req.body.receiverId : [req.body.receiverId];

        // Prepare the values for multiple inserts
        receiverIds.forEach((r, i) => {
            receiverIds[i] = [conversationId, r]
        })
        console.log(receiverIds)
        const valuesForInsert = [...receiverIds, [conversationId, req.body.senderId]];

        const q2 = "INSERT INTO conversation_members(`conversationId`, `userId`) VALUES ?";
        db.query(q2, [valuesForInsert], (err2, data2) => {
            if (err2) return res.status(500).json(err2);

            return res.status(200).json({ "conversationId": conversationId });
        });
    })

}

export const getUserConversations = (req, res) => {
    try {
        const userId = req.params.userId
        const q = "SELECT * FROM conversation_members cm INNER JOIN conversations c ON cm.conversationId = c.id WHERE conversationId IN (SELECT conversationId FROM conversation_members cm WHERE cm.userId = ?)"
        db.query(q, [userId], (err, data) => {
            if (err) return res.status(500).json(err)
            if (data.length === 0) return res.status(404).json("User not found!")
            const transformedData = {}
            data.forEach(item => {
                const conversationId = item.conversationId;
                const member_id = item.userId;

                if (!transformedData[conversationId]) {
                    transformedData[conversationId] = {
                        "conversationId": conversationId,
                        "name": item.name,
                        "members": []
                    };
                }

                transformedData[conversationId].members.push(member_id);
            });
            return res.status(200).json(Object.values(transformedData))
        })
    } catch (err) {
        res.status(500).json(err);
    }

}

export const getAllUsersConverSation = (req, res) => {
    const token = req.cookies.accessToken
    const q = `select * from conversation_members`;
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data)
    })
}

export const deleteConversation = (req, res) => {
    const q1 = "DELETE FROM conversation_members WHERE conversationId = ?"
    const values = [
        req.params.id
    ]
    db.query(q1, [values], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.affectedRows > 0) {
            const q2 = "DELETE FROM conversations WHERE id = ?";
            db.query(q2, [values], (err2, data2) => {
                if (err2) return res.status(500).json(err2);
                if (data2.affectedRows > 0)
                    return res.status(200).json("Delete conversation success!");
                return res.status(403)
            });
        }
        return res.status(403);
    })
}
