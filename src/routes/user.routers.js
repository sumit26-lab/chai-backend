import { Router } from "express";
import { registerUser, loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser, updateAvatarImage,updateAccountDetails,getUserChannel,WatchHistory } from "../controlers/user.controler.js";
import { upload } from "../middlewares/multer.middleware.js";
import {jwtVerify} from '../middlewares/auth.middleware.js'

const router= Router()

router.route("/register").post(upload.fields([
    {name:"avatar",maxCount:1},
    {name:"coverImage",maxCount:1}
]) ,registerUser)

router.route('/login').post(loginUser)
router.route('/logout').post(jwtVerify,logoutUser)
router.route('/refreshToken').post(refreshAccessToken)
router.route('/changeCurrentPassword').post(jwtVerify,changeCurrentPassword)
router.route('/current-user').get(jwtVerify,getCurrentUser)
router.route('/updateAccount').patch(jwtVerify,updateAccountDetails)
router.route('/avatar').patch(jwtVerify, upload.single('avatar'), updateAvatarImage)
router.route('/:username').get(jwtVerify,getUserChannel)
router.route('/watch').get(jwtVerify,WatchHistory)

export default router