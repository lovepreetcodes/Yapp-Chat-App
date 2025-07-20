import express from 'express'
import verifyToken from '../middleware/verify.jwt.js';
import users from '../controllers/users.controller.js';

const userrouter = express.Router()

userrouter.get('/',verifyToken,users)
export default userrouter;