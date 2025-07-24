 import express from 'express'
 import dotenv from 'dotenv'
import router from './routes/auth.route.js'
import userrouter from './routes/users.route.js'
import { connect} from 'mongoose'
import connection from './db/connection.js'
import CookieParser from 'cookie-parser'
import cors from 'cors'
 const app = express()
const PORT = process.env.PORT 
app.use(express.json())
app.use(CookieParser())
app.use(cors({
  origin: ['http://localhost:3000', 'https://whispr-chat-app-frontend.onrender.com'],
  credentials: true,
}));


app.get('/',(req,res)=>{
    res.end("Main auth page")
})
app.use("/auth",router)
app.use("/users",userrouter)


app.listen(PORT,()=>{
    connection()
    console.log(`listening on port ${PORT}`)
})