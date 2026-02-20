const CreateProblem=require('../controllers/userProblem');
const express=require('express');
const problemRouter=express.Router();
const adminMiddleware=require('../userMiddleware/adminAuthMiddleware');
problemRouter.post("/create", adminMiddleware, CreateProblem);//creat
// problemRouter.patch("/:id",UpdateProblem);//update
// problemRouter.delete("/:id",deleteProblem);//delete

// problemRouter.get("/:id",getProblemById);
// problemRouter.get("/",getAllProblem);
// problemRouter.get("/user",getSolvedProblemByUser);

module.exports=problemRouter;