const express=require('express');
const authRouter=express.Router();
const {register,login,logout,adminRegister,deleteProfile}=require("../controllers/userAuthent");
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
authRouter.delete("/deleteProfile",userMiddleware,(deleteProfile))
authRouter.get("/check",userMiddleware,(req,res)=>{
    const reply={
        firstName:req.result.firstName,
        emailId:req.result.emailId,
        _id:req.result._id
    }
    res.status(201).json({
        user:reply,
        message:"Valid user"
    });
})

module.exports=authRouter;