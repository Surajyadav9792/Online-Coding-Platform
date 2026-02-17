const express=require('express');
const authRouter=express.Router();
const {register,login,logout,adminRegister}=require("../controllers/userAuthent");
const userMiddleware=require('../userMiddleware/userAuthMiddleware');
const adminMiddleware=require('../userMiddleware/adminAuthMiddleware');
//register
authRouter.post("/register",(register));
//login
authRouter.post("/login",(login));
//logout
authRouter.post("/logout",userMiddleware,(logout));
//Route of admin register
authRouter.post("/admin/register",adminMiddleware,(adminRegister))
//GetProfile
//authRouter.get("/getProfile",(getProfile));

module.exports=authRouter;