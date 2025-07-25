import jwt from 'jsonwebtoken'

const verifyToken = (req,res,next)=>{
    const token = req.cookies.jwt
    console.log(token)
    if(!token){
        return res.status(401).json({message:"access denied , no token found"})
    }
    try{
        console.log("control reached")
        const verification = jwt.verify(token,process.env.JWT_SECRET)
        console.log("verfication complete",verification)
        next()
    }
    catch(err){
        console.log(err)
        
        return res.status(401).json({message:"unauthorised token"})
    }
}
export default verifyToken