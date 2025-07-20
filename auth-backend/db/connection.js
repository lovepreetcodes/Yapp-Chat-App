import mongoose  from "mongoose";
import dotenv from 'dotenv'
dotenv.config()
const connection= async()=>{
 try {
    
       await mongoose.connect(process.env.DB_URL  )
       console.log("Connected to MongoDB");
   } catch(error) {
       console.log("Error in connecting to MongoDB", error.message);
   }

}

export default connection 