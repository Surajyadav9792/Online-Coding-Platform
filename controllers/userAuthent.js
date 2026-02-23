const Redishclient = require("../config/redis");
const User=require("../model/user");
const validate=require("../utils/validator")
const bcrypt=require('bcrypt'); //(npm i bcrypt)
const jwt=require("jsonwebtoken");//(npm install jsonwebtoken)
const Submission = require("../model/submission");

const register= async(req,res) =>{
    try{     
     validate(req.body);


     req.body.password= await bcrypt.hash(req.body.password,10);

     const user=await User.create(req.body);

     const reply={
      firstName:user.firstName,
      emailId:user.emailId,
      _id:user._id
     }

    const token=jwt.sign(
   {_id:user._id, emailId:user.emailId,role:user.role},
   process.env.JWT_KEY,
   {expiresIn:60*60}
   );

    res.cookie('token',token,{maxAge:60*60*1000});//cookies will expire given milisec time
   //here we shall not only send msg we also send few necessary info of user with this msg 
    //we send the info in json because by this we can send more information in key and value pair
    res.status(201).json({
      user:reply,
      message:"user Registered Successfully"
    })
    }
    catch(err){
      res.status(400).send("Error: "+err.message);
    }
}
const login=async(req,res)=>{
    try{
       const {emailId,password}=req.body;
       //if user forgot to written email
       if(!emailId){ 
        throw new Error("Invalid Credential")
       }
        //if user forgot to written password
        if(!password){ 
        throw new Error("Invalid Credential")
       }

       //here we check the given email and password is present in our database or not
       const user=await User.findOne({emailId});
        if(!user){ 
        throw new Error("Invalid Email")
       }
       //here first we write palin password and then stored hash password
       const match= await bcrypt.compare(password,user.password);
       if(!match){
        throw new Error("Invalid Password");
       }
       const reply={
      firstName:user.firstName,
      emailId:user.emailId,
      _id:user._id
     }
        const token=jwt.sign(
       {_id:user._id, emailId:user.emailId,role:user.role},
        process.env.JWT_KEY,
       {expiresIn:60*60}
   );

    res.cookie('token',token,{maxAge:60*60*1000});//cookies will expire given milisec time
    res.status(201).json({
      user:reply,
      message:"user login Successfully"
    })
    }

    catch(err){
    res.status(401).send("Error: "+err.message);
    }
}
const logout=async(req,res)=>{
  try{
    const {token}=req.cookies;
    const payload=jwt.decode(token);
    await Redishclient.set(`token:${token}`,'Blocked');//by this the token is stored in redis as the name of blocked
    await Redishclient.expireAt(`token:${token}`,payload.exp);//by this the token who store in redis delete after define expire time
    res.cookie("token",null,{expireAt:new Date(Date.now())});//by this the token is expire in cureent time
    res.send("Logged Out Successfully");
  }
  catch(err){
    res.status(503).send("Error :"+err.message);
  }
}
const adminRegister=async(req,res)=>{
     try{   
     validate(req.body);
     req.body.password= await bcrypt.hash(req.body.password,10);
     const user=await User.create(req.body);
     

    const token=jwt.sign(
   {_id:user._id, emailId:user.emailId,role:user.role},
   process.env.JWT_KEY,
   {expiresIn:60*60}
   );

    res.cookie('token',token,{maxAge:60*60*1000});//cookies will expire given milisec time
    res.status(201).send("user Registered Successfully");
    }
    catch(err){
      res.status(400).send("Error: "+err.message);
    }
}
const deleteProfile=async(req,res) =>{
   try{
      const userId=req.result._id;
     //userSchema delete
      await User.findByIdAndUpdate(userId);

      // Also delete through submission
      await Submission.deleteMany({userId}); //by this the userId id deleted from everyWhere

      res.status(200).send("Deleted Successfully");
   }
   catch(err){
    res.status(500).send("Internal Server Error ");
   }
}

module.exports={register,login,logout,adminRegister,deleteProfile};