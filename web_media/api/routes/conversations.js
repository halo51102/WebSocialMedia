import express from 'express'
import { createConversation, getUserConversations, deleteConversation, getConversationMembers } from '../controllers/conversations.js'
const router = express.Router()

router.post("/", createConversation)
router.get("/:userId", getUserConversations)
router.delete("/:id", deleteConversation)
router.get("/members/:conversationId", getConversationMembers)

export default router