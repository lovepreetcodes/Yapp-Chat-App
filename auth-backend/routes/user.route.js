import { Router } from "express";
import { currentUser } from "../controllers/user.controller.js";

const userRouter = Router()

userRouter.get('/me',currentUser)

export default userRouter