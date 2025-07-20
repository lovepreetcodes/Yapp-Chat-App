import { hash } from "bcrypt";
import mongoose from "mongoose";

const userschema = mongoose.Schema({
      username : {
       type: String,
       unique: true,
       required: true
   },
   password : {
       type: String,
       required: true
   },
 
    avatar : {
       type: String,
       default: '../../frontend/public/user.png',
       required: false
   },


});

const userModel = mongoose.model('user',userschema)
export default userModel
