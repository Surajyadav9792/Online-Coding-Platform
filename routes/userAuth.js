const express=require('express');
const authRouter=express.Router();
const {register,login,logout}=require("../controllers/userAuthent");
const userMiddleware=require('../userMiddleware/userAuthMiddleware');
//register
authRouter.post("/register",(register));
//login
authRouter.post("/login",(login));
//logout
authRouter.post("/logout",userMiddleware,(logout));
//GetProfile
//authRouter.get("/getProfile",(getProfile));

module.exports=authRouter;