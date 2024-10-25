import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'

cloudinary.config({
cloud_name:process.env.Cloud_Name,
api_key:process.env.Cloud_Api_Key,
api_secret:process.env.Cloud_Api_Secret
})

const uploadFileCloudniery=async(localfilepath)=>{
 
    try{
       console.log("cloudneryFile",localfilepath)
            if(!localfilepath) return null
       
      const responses= await  cloudinary.uploader.upload(localfilepath,{resource_type:'auto'})
      //upload image in cloudniery get url 
      console.log("res",responses.url)
      fs.unlinkSync(localfilepath)
      return responses
    }
    catch(err){
        //remove file loacl public folder if not upload in cloudniery 
        console.log("coludener Error",err)
        fs.unlinkSync(localfilepath)
        return null

    }
}

export{uploadFileCloudniery}