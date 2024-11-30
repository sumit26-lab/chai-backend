import {AsyncHandler} from '../utills/AsnycHandler.js'
import ApiError from '../utills/ApiError.js'
import { User } from '../models/user.model.js'
import {uploadFileCloudniery} from '../utills/cloudniery.js'
import {ApiResponse} from '../utills/ApiResponse.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

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
 const refreshAccessToken=AsyncHandler(async(req,res,next)=>{
//token access in cookies and body
//decode token
//check db store accesstoken and enter accesstoken

const IncomingAccessToken= req.cookies.refreshToken||req.body.refreshToken
 if(!IncomingAccessToken)  res.status(401).json( ApiError(401,'unauthorize request'))
  try{
const decode= await  jwt.verify(IncomingAccessToken,process.env.Refresh_Token)
const user=await User.findById(decode._id)
console.log("user",user)
 if(!user) {
  res.status(401).json( ApiError(400,'Invalide Refresh token'))
}
 if(IncomingAccessToken !=user?.refreshToken){ 
  throw new ApiError(401,'token is  Expired')
 }
     const {accessToken,refreshToken} =await genrateRefreshTokenAccessToken(user._id)
    const option={   httpOnly:true,
   secure:true
 }
 res.status(200).
 cookie("accessToken",accessToken,option).
 cookie("refreshToken",refreshToken,option).
 json( new ApiResponse(200,{accessToken,refreshToken}," Succesfuly Gernrate Token"))
}catch(err){
  next(err)
  // res.status(401).json( ApiError(401, err?.message || "Invalid refresh token"))
}
//res.status(200).send("ok")
 })
 const changeCurrentPassword=AsyncHandler(async(req,res)=>{
  //check old pass and input new password in body
  const {oldpassword,newpassword}= req.body;
  const user= await User.findById(req.user_id)
  const isPasswordCorrect= await user.isPasswordCorrect(oldpassword)
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password")
} user.password = newpassword
await user.save({validateBeforeSave: false})

return res
.status(200)
.json(new ApiResponse(200, {}, "Password changed successfully"))

 })

 const getCurrentUser=AsyncHandler(async(req,res)=>{
  if(!req.user) throw new  ApiError(400,'user not Found')
    res.status(200).json(new ApiResponse(200,req.user,'user fatech successFuliy !'))

 })
 const updateAccountDetails=AsyncHandler(async(req,res)=>{
const{fullName,email}=req.body
if(!fullName&&email) throw new ApiError(400,'All Field are Requred !')
  const user =await User.findByIdAndUpdate(req.user?._id,
{
$set:{fullName:fullName,email:email}

},{new:true}).select('-password')
 return res.status(201).json(
  new ApiResponse(201,user,'user Upadte sucessfuliy:')
 )
 
 }

)
const updateAvatarImage=AsyncHandler(async(req,res)=>{
  const AvatarImage=req.file?.path;
  if(!AvatarImage)throw new ApiError(400,'AvatarImage file is missing')

    const avatarUrl= await uploadFileCloudniery(AvatarImage)
    if(!avatarUrl)throw new ApiError(400,'Error while upload image on Avatar-')

 const updatedata=  await   User.findOneAndUpdate(req.user?._id,{$set:{avatar:avatarUrl.url}},{new:true}).select('-password')
 res.status(201).json(ApiResponse(201,updatedata,'Avatar Image update SuccessFuliy'))
})

const getUserChannel=AsyncHandler(async(req,res)=>{
  const {username}=req.params

  if(!username?.trim()) throw new ApiError(400,'username is missing ?');
 const Channel= await User.aggregate([
    {
    $match:{username:username?.toLowerCase()},
    $lookup:{
    from:'subscriptions',
    localField:"_id",
    foreginField:"channel",
     as:"subscriber"
    }
    
  },{
    $lookup:{
       from:"subscriptions",
       localField:"_id",
       foreginField:"subscriber",
       as:"subscribedTo",


    }},
    {
     $addFields:{
      subscriberCount:{$size:'$subscriber'}
     ,
      ChannelsubscribedToCount:{
       $size: '$subscribedTo'}
     
      },
      isSubscribed:{
        $cond:{
          if:{$in:[req.user?._id,'$subscriptions.subscriber']},
          then:true,
          else:false
        }
      },

      
    },
    {
      $project:{
        username:1,
        fullName:1,
        subscriberCount:1,
        ChannelsubscribedToCount:1,
        isSubscribed:1




      }
    
    }
  ])
  
  if(!Channel.length) throw new ApiError(401,'Channel dose not exists !')

    res.status(200).json( new ApiResponse(200,Channel[0],'channel data SuccessFuliy Retives'))

})

const WatchHistory=AsyncHandler(async(req,res)=>{
  const user= await User.aggregate([
    {$match:{_id:new mongoose.Types.ObjectId(req.user._id)}},{
      $lookup:{
        from:'Videos',
        localField:"owner",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[
          {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project: {
                      fullName: 1,
                      username: 1,
                      avatar: 1
                  }
              }
              ]
            }
          }
        ]
      },
  
    }
  ])
  
return  res.status(200).json(
    new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully"
    )
)
})
export{registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateAvatarImage,getUserChannel,WatchHistory}