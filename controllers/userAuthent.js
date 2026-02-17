const Redishclient = require("../config/redis");
const User=require("../model/user");
const validate=require("../utils/validator")
const bcrypt=require('bcrypt'); //(npm i bcrypt)
const jwt=require("jsonwebtoken");//(npm install jsonwebtoken)

const register= async(req,res) =>{
    try{     
     validate(req.body);

     
     req.body.password= await bcrypt.hash(req.body.password,10);
     const user=await User.create(req.body);

    const token=jwt.sign(
   {_id:user._id, emailId:user.emailId},
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
       const result=await User.findOne({emailId});
        if(!result){ 
        throw new Error("Invalid Email")
       }
       //here first we write palin password and then stored hash password
       const match= await bcrypt.compare(password,result.password);
       if(!match){
        throw new Error("Invalid Password");
       }
        const token=jwt.sign(
       {_id:result._id, emailId:result.emailId},
        process.env.JWT_KEY,
       {expiresIn:60*60}
   );

    res.cookie('token',token,{maxAge:60*60*1000});//cookies will expire given milisec time
    res.status(201).send("user login Successfully");
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

module.exports={register,login,logout};