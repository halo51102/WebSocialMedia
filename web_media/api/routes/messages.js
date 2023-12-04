import express from 'express'
import { addMessage, getMessages, upsertReaction } from '../controllers/messages.js'
const router=express.Router()

router.post("/", addMessage)
router.get("/:conversationId", getMessages)
router.post("/:messageId", upsertReaction)

export default router