import {db} from "../connect.js"

export const getUser= (req,res)=>{
    //TODO
    const userId = req.query.userId;
    const username = req.query.username;
    try {
        const user = userId
        const q = "SELECT * FROM users WHERE id=?"
        db.query(q, [userId], (err, data) => {
            if (err) return res.status(500).json(err)
            if(data.length===0) return res.status(404).json("User not found!")
            const { password, ...other } = data[0];
            return res.status(200).json(other);
        })
        
    } catch (err) {
        res.status(500).json(err);
    }
}