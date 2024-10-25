
export const AsyncHandler=(RequestHandler)=>{
   return (req,res,next)=>{
     Promise.resolve(RequestHandler(req,res,next)).catch(err=>Promise.reject(err))
}}

