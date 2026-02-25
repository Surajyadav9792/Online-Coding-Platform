const express=require('express');
const submitRouter=express.Router();
const userMiddleware=require('../userMiddleware/userAuthMiddleware');
const {submitCode,runCode}=require('../controllers/userSubmission');
submitRouter.post("/submit/:problemId", userMiddleware, submitCode);
submitRouter.post("/run/:problemId", userMiddleware, runCode);


module.exports=submitRouter;