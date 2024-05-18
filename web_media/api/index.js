import express from 'express'
const app = express()
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import postRoutes from './routes/posts.js'
import commentRoutes from './routes/comments.js'
import likeRoutes from './routes/likes.js'
import conversationRoutes from './routes/conversations.js'
import messageRoutes from './routes/messages.js'
import relationshipRoutes from './routes/relationships.js'
import groupRoutes from './routes/groups.js'
import storyRoutes from './routes/stories.js'
import notificationsRoutes from './routes/notifications.js'
import picOfPostRoutes from './routes/picsPost.js'
import userTagPostRoutes from './routes/usersTagPost.js'
import storageRoutes from './routes/storageOfUser.js'
import cors from "cors"
import multer from "multer"
import cookieParser from "cookie-parser"
import AWS from 'aws-sdk';
import multerS3 from 'multer-s3';

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", true)
    next()
})
app.use(express.json())
app.use(cors({
    origin: "http://localhost:3000",
}
))
app.use(cookieParser())

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../client/public/upload')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})

const upload = multer({ storage: storage })
app.post("/api/upload", upload.single("file"), (req, res) => {
    const file = req.file;
    res.status(200).json(file.filename)
})

app.use("/api/auth", authRoutes)
{/*http://localhost:8800/api/auth/login POST */}

app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/likes", likeRoutes)
app.use("/api/conversations", conversationRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/likes", likeRoutes)
app.use("/api/relationships", relationshipRoutes)
app.use("/api/stories", storyRoutes)
app.use("/api/notifications", notificationsRoutes)

app.use("/api/groups", groupRoutes)
app.use("/api/picOfPost", picOfPostRoutes)
app.use("/api/userTagPost", userTagPostRoutes)
app.use("/api/storage", storageRoutes)

app.use("/api/groups", groupRoutes)

app.listen(8800, () => {
    console.log("API working")
})