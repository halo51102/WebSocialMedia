import express from 'express'
import { getGroup, getAllGroup, addGroup, deleteGroup,getMemberGroup, joinGroup,outGroup } from '../controllers/group.js'
const routes=express.Router()

routes.get("/:groupId",getGroup)
routes.get("/",getAllGroup)
routes.post("/",addGroup)
routes.delete("/",deleteGroup)
routes.get("/members",getGroup)
routes.post("/members",addGroup)
routes.delete("/members",deleteGroup)


export default routes