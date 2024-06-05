import express from 'express'
import { createConversation, getUserConversations,getAllUsersConverSation } from '../controllers/conversations.js'
const router=express.Router()

router.post("/", createConversation)
router.get("/allmembersroom",getAllUsersConverSation)
router.get("/:userId", getUserConversations)


export default router