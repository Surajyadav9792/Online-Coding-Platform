const {getLanguageId,submitBatch, submitoken}=require("../utils/fetch_language_id");
const Problem = require("../model/problem");
const User=require("../model/user");
const Submission = require("../model/submission");

const CreateProblem=async (req,res)=>{

    const {
        title, description, difficulty, explanation, tags,
        visibleTestCases, hiddenTestCases,
        startCode, referenceSolution
    }=req.body;

   try{

   for(const {language,completeCode} of referenceSolution){

    const languageId=getLanguageId(language);

    const submissions=visibleTestCases.map((testcase)=>({
       source_code:completeCode,
       language_id:languageId,
       stdin:testcase.input,
       expected_output:testcase.output 
    }));

    const submitResult=await submitBatch(submissions);

    if(!submitResult || !Array.isArray(submitResult)){
        return res.status(500).send("Judge0 submission failed");
    }

    const resultToken=submitResult.map((value)=>value.token);

    const testResult=await submitoken(resultToken);

    if(!testResult){
        return res.status(500).send("Judge0 result fetch failed");
    }

   for(const test of testResult){
    if(test.status_id !== 3){
        return res.status(400).send("Reference solution failed on testcase");
    }
   }

   }

   await Problem.create({
        title,
        description,
        difficulty,
        explanation,
        tags,
        visibleTestCases,
        hiddenTestCases,
        startCode,
        referenceSolution,
        problemCreator:req.result._id
   });

   res.status(201).send("Problem saved successfully");

   }
   catch(err){
      res.status(500).send(err.message);
   }  

}

const UpdateProblem=async (req,res) =>{
   const {id}=req.params;
    const {
        title, description, difficulty, explanation, tags,
        visibleTestCases, hiddenTestCases, 
        startCode, referenceSolution
    }=req.body;

   try{

      if(!id){
        return res.status(400).send("Missing ID Field");
      }

      const DsaProblem=await Problem.findById(id);
      if(!DsaProblem){
         return res.status(404).send("ID is not present in server");
      }

     for(const {language,completeCode} of referenceSolution){

    const languageId=getLanguageId(language);

    const submissions =visibleTestCases.map((testcase)=>({
       source_code:completeCode,
       language_id:languageId,
       stdin:testcase.input,
       expected_output:testcase.output 
    }));

    const submitResult=await submitBatch(submissions);

    if(!submitResult || !Array.isArray(submitResult)){
        return res.status(500).send("Judge0 submission failed");
    }

    const resultToken=submitResult.map((value)=>value.token);

    const testResult=await submitoken(resultToken);

    if(!testResult){
        return res.status(500).send("Judge0 result fetch failed");
    }

    for(const test of testResult){

        if(test.status_id !== 3){
           return res.status(400).send("Reference solution failed on testcase");
        }
    }

     }

     const newProblem=await Problem.findByIdAndUpdate(id,{...req.body},{validator:true,new:true})
     res.status(200).send(newProblem);

   }
   catch(err){
          res.status(404).send("Error: "+err);
   }
}

const deleteProblem=async(req,res)=>{
   const {id}=req.params;
   try{

     if(!id){
        return res.status(400).send("Missing ID Field");
      }

      const deleteProblem=await Problem.findByIdAndDelete(id);
      if(!deleteProblem){
        return res.status(400).send("Problem is Missing");
      }

       res.status(400).send("Deleted Successfully");
   }
   catch(err){
         res.status(404).send("Error: "+err);
   }
}

const getProblemById = async (req,res)=>{
    const {id}=req.params;
   try{

     if(!id){
        return res.status(400).send("Missing ID Field").select("_id title description tags difficulty visibleTestCases startCode"); 
      }
      const getProblem=await Problem.findById(id);
      if(!getProblem){
        return res.status(400).send("Problem is Missing")
      }

       res.status(200).send(getProblem);
   }
   catch(err){
         res.status(404).send("Error: "+err);
   }
}

const getAllProblem=async (req,res)=>{
   try{
      const getProblem = await Problem.find({}).select("_id title description tags difficulty");
      if(getProblem.length==0){
        return res.status(200).send(getProblem); 
      }
   }
   catch(err){
         res.status(500).send("Error: "+err);
   }
}

const getSolvedProblemByUser=async (req,res)=>{
  try{
   const userId=req.result._id;

   const user=await User.findById(userId).populate({
      path:"problemSolved",
      select:"_id title difficulty tags"
   });

    res.status(200).send(user.problemSolved);
  }
   catch(err){
         res.status(500).send("Error: "+err);
   }
}

const submittedProblem=async(req,res)=>{
   try{
        const userId=req.result._id;
        const problemId=req.params._id;

      const ans=await Submission.find(userId,problemId);
        if(ans.length==0){
         res.status(200).send("No Submission is present");
        }
      res.status(200).send(ans);
   }
   catch(err){
      res.status(200).send("Internal Server Error ");
   }
}

module.exports={CreateProblem,UpdateProblem,deleteProblem,getProblemById,getAllProblem,getSolvedProblemByUser,submittedProblem};