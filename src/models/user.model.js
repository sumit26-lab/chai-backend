import mongoose ,{ Schema } from "mongoose";
import bycrypt from 'bcrypt'
import { sign } from "jsonwebtoken";

const userSchema=new Schema({
 username:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
    index:true
 },
 fullName:{
    type:String,
    required:true,
    lowercase:true,
    trim:true,
 },
 email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
    index:true
 },
 avatar:{
    type:String,
    required:trusted
    
 },  
 coverImage:{
    type:String,
    
 },
 watchHistory:{
    type:Schema.Types.ObjectId,
    ref:'Video'
 },
 password:{
    type:String,
    required:[true,'password required'],
    
  

 }
},{timestamps:true})
userSchema.pre("save",async function(next){
    if(!this.isModified('password')) return next()
    this.password=bycrypt.hash(this.password,10)
next()
})
userSchema.methods.isPasswordCorrect= async function(password){
  return  await bycrypt.compare(password,this.password)
}
userSchema.methods.genrateAccessToken= async function(){
 return await sign({
        _id:this._id,
        username:this.username,
        email:this.email,
        fullName:this.email
     },process.env.Access_Token,{expiresIn:process.env.Access_Token_Expire})
}
userSchema.methods.genrateRefreshToken= async function(){
    return await sign({
        _id:this._id,
        
     },process.env.Refresh_Token,{expiresIn:process.env.Refresh_Token_Expire})
}

export const User=mongoose.model('User',userSchema)