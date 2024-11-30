// import {ApiError} from '../utills/ApiError'
import ApiError from '../utills/ApiError.js'
import {AsyncHandler} from '../utills/AsnycHandler.js' 
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'

const jwtVerify=AsyncHandler(async(req,res,next)=>{
    try{
    const token = req.header
    ('Authorization')?.replace("Bearer ","")
    if(!token) {
      throw new ApiError(401,"Unauthorize requiest")
    }
     const Decoded= jwt.verify(token,process.env.Access_Token)
    const user= await User.findById(Decoded._id).select("-password -refreshToken")
    req.user=user
    next()
}catch(error){
    
    throw new ApiError(401, error.message || "Invalid access token", [], error.stack);
}

})

export{jwtVerify}