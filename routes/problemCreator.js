const {CreateProblem,UpdateProblem,deleteProblem,getProblemById,getAllProblem,getSolvedProblemByUser}=require('../controllers/userProblem');
const express=require('express');
const problemRouter=express.Router();
const adminMiddleware=require('../userMiddleware/adminAuthMiddleware');
const userMiddleware=require('../userMiddleware/userAuthMiddleware');
problemRouter.post("/create", adminMiddleware, CreateProblem);//creat
problemRouter.put("/:id",adminMiddleware,UpdateProblem);//update
 problemRouter.delete("/:id",adminMiddleware,deleteProblem);//delete

 problemRouter.get("/:id",userMiddleware,getProblemById);
 problemRouter.get("/",userMiddleware,getAllProblem);
problemRouter.get("/user",userMiddleware,getSolvedProblemByUser);

module.exports=problemRouter;