import userModel from "../models/user.model.js";

const users = async(req,res)=>{
    try{
        const users = await userModel.find({},'username')
        console.log(users)
        res.status(200).json(users)
    }
    catch(err){
        console.log(err)
        res.status(500).json({message:'server error'})
    }
}
export default users