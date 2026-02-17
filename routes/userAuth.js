const express=require('express');
const authRouter=express.Router();
const {register,login,logout}=require("../controllers/userAuthent");

//register
authRouter.post("/register",(register));
//login
authRouter.post("/login",(login));
//logout
authRouter.post("/logout",(logout));
//GetProfile
//authRouter.get("/getProfile",(getProfile));

module.exports=authRouter;