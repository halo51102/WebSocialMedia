import {db} from "../connect.js"
export const createConversation = (req,res)=>{
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
        db.query(q2, [[[conversationId, req.body.senderId], [conversationId, req.body.receiverId]]], (err2, data2) => {
            if (err2) return res.status(500).json(err2)
            return res.status(200).json("Conversation has been created.")
        })
    })
    
}

export const getUserConversations = (req,res)=>{
    try {
        const userId = req.params.userId
        const q = "SELECT * FROM conversation_members cm WHERE conversationId = (SELECT conversationId FROM conversation_members cm WHERE cm.userId = ?)"
        db.query(q, [userId], (err, data) => {
            if (err) return res.status(500).json(err)
            if(data.length===0) return res.status(404).json("User not found!")
            const transformedData = {}
            data.forEach(item => {
                const conversationId = item.conversationId;
                const member_id = item.userId;
            
                if (!transformedData[conversationId]) {
                    transformedData[conversationId] = {
                        "conversationId": conversationId,
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

// export const addPost=(req,res)=>{
//     const token = req.cookies.accessToken
//     if (!token) return res.status(401).json("Not logged in!")

//     jwt.verify(token, "secretkey", (err, userInfo) => {
//         if (err) return res.status(403).json("Token is not valid!")

//         const q =
//         "INSERT INTO posts(`desc`, `img`, `createdAt`, `userId`) VALUES (?)"
//         const values = [
//         req.body.desc,
//         req.body.img,
//         moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
//         userInfo.id
//         ]

//         db.query(q, [values], (err, data) => {
//         if (err) return res.status(500).json(err)
//         return res.status(200).json("Post has been created.")
//         })
//     })
// }
