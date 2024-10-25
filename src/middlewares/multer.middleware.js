import multer from "multer";

const storage= multer.diskStorage({
destination:function(req,file,cb){
    cb(null,'./public/temp')
},
filename:function(req,file,cb){
    // console.log("file multer",file)
  let type= file.mimetype?.split('/')[1]
 
    const uniqueSufix= Date.now() + '-' +Math.round(Math.random()*1E9)+'.'+type
    cb(null,file.fieldname+ '-'+ uniqueSufix)
}    

})

export const upload= multer({storage})