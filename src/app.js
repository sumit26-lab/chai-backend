import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import ApiError from './utills/ApiError.js'
const app =express()
app.use(cookieParser())
app.use(cors({
    origin:process.env.Cors_Origin,
    credentials:true,
    methods:['GET',"POST","DELETE",'UPDATE']
}))
app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))


import userRoute from './routes/user.routers.js'
//userRouter 
app.use('/api/v1/users',userRoute)
// Global Error Handling Middleware
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        // Handle ApiError with custom structure
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors, // Optionally include specific errors (e.g., validation errors)
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Only in dev mode
        });
    }

    // If it's not an ApiError, send a generic internal server error
    console.error(err); // Log the error details (optional)
    return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        errors: [],
    });
});
export{app}