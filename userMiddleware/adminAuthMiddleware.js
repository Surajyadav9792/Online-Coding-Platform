
const jwt=require('jsonwebtoken');
require('dotenv').config();
const User=require('../model/user');
const Redishclient=require('../config/redis');
const adminAuthMiddleware=async(req,res,next) =>{
    try{
        const {token}=req.cookies;
      if(!token){
        throw new Error ("Token is not present");
      }
    //It obtain the data from payload and if token is expire thorw the error 
    const payload =jwt.verify(token,process.env.JWT_KEY);

    const {_id}=payload;
    if(!_id){
        throw new Error("Invalid Token");
    }
    if(payload.role!='admin'){
        throw new Error("Invalid token");
    }
    const result = await User.findById(_id);//here we find the user on the basis of Id in model
    if(!result){
         throw new Error("User Doesn't Exist");
    }
    //here we check that user is present in Redis blocklist table
     const IsBlocked=await Redishclient.exists(`token:${token}`);
     if(IsBlocked){
       throw new Error("Invalid Token");
     }
     // If not present then user data store in result
     req.result=result;
     next();
    }
    catch(err){
    res.status(401).send("Error: "+err.message);
    }
}
module.exports=adminAuthMiddleware;