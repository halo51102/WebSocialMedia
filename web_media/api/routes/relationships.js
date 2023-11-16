import express from 'express'
import { getRelationship, addRelationship, deleteRelationship } from '../controllers/relationship.js'
const routes=express.Router()

routes.get("/",getRelationship)
routes.post("/",addRelationship)
routes.delete("/",deleteRelationship)


export default routes