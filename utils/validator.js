const validator=require("validator");

const validate=(data)=>{
    const mandatoryField=['firstName','emailId','password'];
    const Isallowed=mandatoryField.every((k)=>Object.keys(data).includes(k));

    if(!Isallowed){
        throw new Error("Some Field Missing");
    }

    if(!validator.isEmail(data.emailId)){
         throw new Error("Invalid Email");
    }

    if(!validator.isStrongPassword(data.password)){
         throw new Error("Weak Password");
    }

    if(data.firstName.length<3 || data.firstName.length>21){
        throw new Error("Name length should be between 3 and 21");
    }
}

module.exports=validate;
