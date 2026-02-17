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


module.exports={register,login,logout};