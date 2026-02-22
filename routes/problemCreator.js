const {CreateProblem,UpdateProblem,deleteProblem,getProblemById,getAllProblem,getSolvedProblemByUser,submittedProblem}=require('../controllers/userProblem');
const express=require('express');
const problemRouter=express.Router();
const adminMiddleware=require('../userMiddleware/adminAuthMiddleware');
const userMiddleware=require('../userMiddleware/userAuthMiddleware');

problemRouter.post("/create", CreateProblem);//creat
problemRouter.put("/:id",adminMiddleware,UpdateProblem);//update
 problemRouter.delete("/:id",adminMiddleware,deleteProblem);//delete

 problemRouter.get("/:id",userMiddleware,getProblemById);
 problemRouter.get("/",userMiddleware,getAllProblem);
problemRouter.get("/user",userMiddleware,getSolvedProblemByUser);
problemRouter.get("/submittedProblem",userMiddleware,submittedProblem);

module.exports=problemRouter;