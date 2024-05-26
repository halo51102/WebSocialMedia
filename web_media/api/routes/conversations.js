import express from 'express'
import { createConversation, getUserConversations, deleteConversation } from '../controllers/conversations.js'
const router = express.Router()

router.post("/", createConversation)
router.get("/:userId", getUserConversations)
router.delete("/:id", deleteConversation)

export default router