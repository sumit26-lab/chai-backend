
const AsyncHandler=(RequestHandler)=>{
    (req,res,next)=>{
    return Promise.resolve(RequestHandler(req,res,next)).catch(err=>Promise.reject(err))
}}

export {AsyncHandler}