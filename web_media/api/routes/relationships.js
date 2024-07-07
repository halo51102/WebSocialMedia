import express from 'express'
import { getRelationship, addRelationship, deleteRelationship, suggestFollow, getFollowEd, whoFollow } from '../controllers/relationship.js'
const routes = express.Router()

routes.get("/suggest-follow", suggestFollow)
routes.get("/who-follow", whoFollow)
routes.get("/ed", getFollowEd)
routes.get("/", getRelationship)
routes.post("/", addRelationship)
routes.delete("/", deleteRelationship)


export default routes