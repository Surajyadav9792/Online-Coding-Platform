const mongoose=require('mongoose');
const {Schema}=mongoose;

const userSchema=new Schema({
    firstName:{
        type:String,
        required:true,
        minLength:2,
        maxLength:20
    },
    lastName:{
        type:String,
        minLength:2,
        maxLength:20
    },
    emailId:{
         type:String,
         required:true,
         unique:true,
         trim:true,
         lowercase:true,
         immutable:true,
    },
    age:{
        type:Number,
        minLength:12,
        maxLength:70
    },
    role:{              
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    problemSolved:{
        type:[String]
    },
    password:{
        type:String,
        required:true
    }
},{
    timestamps:true
});

const User=mongoose.model("User",userSchema);

module.exports=User;
