const express=require('express'); //(npm i express)
const app=express();
require('dotenv').config(); //(npm i dotenv)
const main=require('../config/db');
const cookieParser=require('cookie-parser'); //(npm i cookie-parser)
const authRouter=require('../routes/userAuth');
const client=require('../config/redis');
const userMiddleware=require('../userMiddleware/userAuthMiddleware');

app.use(express.json());  //It convert req.body json data in java script object because through the req.body the data is come in json formate and we need in javascript formate same as in case of cookiese
app.use(cookieParser());

app.use("/user",authRouter);

main()
.then(async()=>{
    console.log("DB connected");
    await client.connect();   
    console.log("Redis connected");

    app.listen(process.env.PORT,()=>{
        console.log("Server listening at port : "+process.env.PORT);
    });

})
.catch(err => console.log("Error Occured: "+ err));

