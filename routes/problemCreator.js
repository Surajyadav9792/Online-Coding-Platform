const express=require('express');
const problemRouter=express.Router();
const adminMiddleware=require('../userMiddleware/adminAuthMiddleware');
problemRouter.post("/creat",adminMiddleware,CreateProblem);//creat
problemRouter.patch("/:id",UpdateProblem);//update
problemRouter.delete("/:id",deleteProblem);//delete

problemRouter.get("/:id",getProblemById);
problemRouter.get("/",getAllProblem);
problemRouter.get("/user",getSolvedProblemByUser);
