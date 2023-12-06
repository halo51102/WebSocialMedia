import { db } from "../connect.js"
export const addMessage = (req, res) => {
    const q1 = "INSERT INTO messages(`conversationId`, `senderId`, `text`, `type`, `createdAt`, `updatedAt`, `file_url`, `title`) VALUES (?)"
    const createdAt = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
    const updatedAt = createdAt
    const values = [
        req.body.conversationId,
        req.body.senderId,
        req.body.text,
        req.body.type,
        createdAt,
        updatedAt,
        req.body.file_url,
        req.body.title
    ]
    db.query(q1, [values], (err, data) => {
        if (err) return res.status(500).json(err)
        const insertedData = {
            conversationId: req.body.conversationId,
            id: data.insertId,
            senderId: req.body.senderId,
            text: req.body.text,
            type: req.body.type,
            createdAt: createdAt,
            updatedAt: updatedAt
        }
        return res.status(200).json(insertedData)
    })
}

export const getMessages = (req, res) => {
    const q1 = "SELECT m.*, userId, reaction, rm.id as reactionId FROM messages m LEFT JOIN reaction_message rm ON m.id = rm.messageId WHERE conversationId = ?"
    const values = [
        req.params.conversationId,
    ]
    db.query(q1, [values], (err, data) => {
        if (err) return res.status(500).json(err)
        const messages = data;
        const transformedData = Object.values(messages.reduce((acc, message) => {
            const { id, reactionId, userId, reaction, ...rest } = message;
            if (!acc[id]) {
              acc[id] = { id, ...rest, reactions: [] };
            }
            if (message.userId && message.reaction) {
                acc[id].reactions.push({ reactionId: message.reactionId, userId: message.userId, reaction: message.reaction });
            } else {
                acc[id].reactions = null;
            }
            return acc;
          }, {}));
        return res.status(200).json(transformedData)
    })
}

export const upsertReaction = (req, res) => {
    if (!req.body.reactionId) {
        const q1 = "INSERT INTO reaction_message(`messageId`, `userId`, `reaction`) VALUES (?)"
        const values = [
            req.body.messageId,
            req.body.userId,
            req.body.reaction,
        ]
        
        db.query(q1, [values], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.status(200).json({
                reactionId: data.insertId,
                userId: req.body.userId,
                reaction: req.body.reaction
            })
        })
        // console.log("ABC", q1)
    } else {
        const q1 = "UPDATE reaction_message SET reaction=? WHERE id=?"
        const values = [
            req.body.reactionId,
            req.body.reaction
        ]
        
        db.query(q1, [req.body.reaction, req.body.reactionId], (err, data) => {
            if (err) return res.status(500).json(err)
            return res.status(200).json("Update reaction")
        })
    }
} 