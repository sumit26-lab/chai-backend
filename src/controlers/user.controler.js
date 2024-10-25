import {AsyncHandler} from '../utills/AsnycHandler.js'
import ApiError from '../utills/ApiError.js'
import { User } from '../models/user.model.js'
import {uploadFileCloudniery} from '../utills/cloudniery.js'
import {ApiResponse} from '../utills/ApiResponse.js'
import jwt from 'jsonwebtoken'

const genrateRefreshTokenAccessToken=async(userId)=>{
  const user= await User.findById(userId)
const accessToken= await user.genrateAccessToken()
const refreshToken = await user.genrateRefreshToken()
user.refreshToken=refreshToken
user.save({validateBeforeSave:false})
return {accessToken, refreshToken}
}

 const registerUser=AsyncHandler( async(req,res)=>{
    //get data in frontend
    // valiadtion in data
    //check user email username not exits
    //check avtar image coverimage in data
    // send data in cloudner retrive image url 
    let {username,fullName,email,password}= req.body
   if([username,fullName,email,password].some((field)=>field?.trim()==="")){

   throw new ApiError(400,'all fildes required')

   }
  //  console.log(req.body,req.files)
  const Existinguser= await User.findOne({
    $or:[
        {username},{email}
    ]
  })
  if(Existinguser){
    throw new ApiError(409,'user with email and  paswword allReady exits ')
    
  }
  
 const avatarImage= req.files.avatar[0]?.path
 const coverImage= req.files.coverImage[0]?.path
 console.log(`Avatar image ${avatarImage}\n coverImage ${coverImage}`)
 
 if(!avatarImage) throw new ApiError(400,'avatar image is required !');
  

//upload to cloudniry avatar and coverImage
const avatarimageResponse= await uploadFileCloudniery(avatarImage)
const coverImageResponse= await uploadFileCloudniery(coverImage)
console.log(`avatarImage url ${avatarimageResponse?.url} /n coverimageUrl ${coverImageResponse?.url}`)
   const user= await User.create({
   fullName,
   avatar:avatarimageResponse?.url,
   coverImage:coverImageResponse?.url || "",
   email,
   password,
   username:username.toLowerCase()
   })
   const createdUser= await User.findById(user._id).
   select("-password -refreshToke")
  if(!createdUser){
    throw new ApiError(500,' Something Went Worng will Registraion User !');
    
  }
  return  res.status(200).json(new ApiResponse(201,createdUser,"User register SucessFuliy"))
})

 const loginUser= AsyncHandler(async(req,res)=>{
  // user data in frontend identifyer 
  //check if user exits are not
  //refrshToken 
  const {email,username,password}=req.body
  console.log(email)
  if (!username && !email) {
    throw new ApiError(400, "username or email is required")
}
  const user= await User.findOne({
    $or:[{email},{username}]
  })
  console.log("user-->",user)
  if(!user){
    throw new ApiError(404,'User doses not exits !')
  }
 
 const isValidePassword=await user.isPasswordCorrect(password)
 if(!isValidePassword)  throw new ApiError(401  ,'invalid user credenials !')
  
 const {accessToken,refreshToken} =await genrateRefreshTokenAccessToken(user._id)
console.log(`Accesstoken ${accessToken} /n  reshreshToken,${refreshToken}`)
  const loggedInuser=await user?{email :user.email,username:user.username,fullName:user.fullName}:""
  const option={
    httpOnly:true,
    secure:true
  }
  res.status(200).
  cookie("accessToken",accessToken,option).
  cookie("refreshToken",refreshToken,option).
  json( new ApiResponse(200,{user:loggedInuser, accessToken,refreshToken},"User logged In Succesfuly"))
 })
 const logoutUser= AsyncHandler(async(req,res)=>{
  const user= req.user
  await User.findByIdAndUpdate(user._id,
    {
    $set:{refreshToken:undefined}
    },
    {new:true}
    
 
)
const option={
  httpOnly:true,
  secure:true
}
res.status(200).clearCookie('accessToken',option).clearCookie('refreshToken',option).json(new ApiResponse(200,null,'Logout sucessfuliy'))
   

 })
 const refreshAccessToken=AsyncHandler(async()=>{
//token access in cookies and body
//decode token
//check db store accesstoken and enter accesstoken
const incomingAccesstokne= req.cookies.refreshToken||req.body.refreshToken
if(!incomingAccesstokne)  throw new  ApiError(401,'unauthorize request')
  try{
const decode= await  jwt.verify(incomingAccesstokne,process.env.refreshToken)
const user= User.findById(decode._id)
if(!user) throw new ApiError(40,'Invalide Refresh token')
   if(incomingAccesstokne!=user?.refreshToken) throw new ApiError(40,'token is  Expired')
    const {accessToken,refreshToken} =await genrateRefreshTokenAccessToken(user._id)
   
const option={
  httpOnly:true,
  secure:true
}
res.status(200).
cookie("accessToken",accessToken,option).
cookie("refreshToken",refreshToken,option).
json( new ApiResponse(200,{user:loggedInuser, accessToken,refreshToken}," Succesfuly Gernrate Token"))
}catch(err){
  throw new ApiError(401, error?.message || "Invalid refresh token")
}
 })
export{registerUser,loginUser,logoutUser,refreshAccessToken}