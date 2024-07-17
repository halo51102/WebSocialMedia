import express from 'express'
import { getRelationship, addRelationship, deleteRelationship, suggestFollow, getFollowEd, whoFollow, getPending, getPended, acceptFollowed, getFriend, rejectFollowed } from '../controllers/relationship.js'
const routes = express.Router()

routes.get("/suggest-follow", suggestFollow)
routes.get("/who-follow", whoFollow)
routes.get("/ed", getFollowEd)
routes.get("/pending",getPending)
routes.get("/pended",getPended)
routes.put("/acceptFollowed",acceptFollowed)
routes.delete("/rejectFollowed",rejectFollowed)
routes.get("/", getRelationship)
routes.post("/", addRelationship)
routes.delete("/", deleteRelationship)
routes.get("/friend", getFriend)

export default routes