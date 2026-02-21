const {getlanguageById,submitBatch,submitToken}=require("../utils/fetch_language_id");
const Problem = require("../model/problem");

const CreateProblem=async (req,res)=>{

    // destructuring the data coming from frontend (Postman/body)
    const {
        title, description, difficulty, explanation, tags,
        visibleTestCases, hiddenTestCases,   // FIXED spelling
        startCode, referenceSolution
    }=req.body;

   try{

   // loop over each reference solution (C++, Java, JS etc.)
   for(const {language,completeCode} of referenceSolution){

    // get language id for judge0
    const languageId=getlanguageById(language);

    // creating batch submissions according to judge0 syntax
    // each visible testcase will be executed
    const submissions=visibleTestCases.map((testcase)=>({
       source_code:completeCode,
       language_id:languageId,
       stdin:testcase.input,
       expected_output:testcase.output 
    }));

    // sending submissions to judge0
    const submitResult=await submitBatch(submissions);

    // safety check if judge0 failed
    if(!submitResult || !Array.isArray(submitResult)){
        return res.status(500).send("Judge0 submission failed");
    }

    // extracting tokens from judge0 response
    const resultToken=submitResult.map((value)=>value.token);

    // using tokens to fetch final result from judge0
    const testResult=await submitToken(resultToken);

    // safety check
    if(!testResult){
        return res.status(500).send("Judge0 result fetch failed");
    }

    // checking all testcases passed or not
    for(const test of testResult){
        // judge0 returns status.id
        if(test.status.id !=3){
           return res.status(400).send("Reference solution failed on testcase");
        }
    }

   }

   // if all reference solutions passed, store problem in DB
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
        problemCreator:req.result._id   // user from middleware
   });

   // success response
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

    // get language id for judge0
    const languageId=getlanguageById(language);

    // creating batch submissions according to judge0 syntax
    // each visible testcase will be executed
    const submissions=visibleTestCases.map((testcase)=>({
       source_code:completeCode,
       language_id:languageId,
       stdin:testcase.input,
       expected_output:testcase.output 
    }));

    // sending submissions to judge0
    const submitResult=await submitBatch(submissions);

    // safety check if judge0 failed
    if(!submitResult || !Array.isArray(submitResult)){
        return res.status(500).send("Judge0 submission failed");
    }

    // extracting tokens from judge0 response
    const resultToken=submitResult.map((value)=>value.token);

    // using tokens to fetch final result from judge0
    const testResult=await submitToken(resultToken);

    // safety check
    if(!testResult){
        return res.status(500).send("Judge0 result fetch failed");
    }

    // checking all testcases passed or not
    for(const test of testResult){
        // judge0 returns status.id
        if(test.status.id !=3){
           return res.status(400).send("Reference solution failed on testcase");
        }
    }

     }
     const newProblem=await Problem.findByIdAndUpdate(id,{...req.body},{validator:true,new:true}) // bye the validator our enum is checked and by new the new model is give  
    res.status(200).send(newProblem);
   }
   catch(err){
          res.status(404).send("Error: "+err);
   }
}

const deleteProblem=async(req,res) =>{
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

const getProblemById = async (req,res) =>{
    const {id}=req.params;
   try{

     if(!id){
      /* here by the .select() function we can provide data or field as per our
       wish ans if we want that any particular field is not consider then we need to write (-) in that particular field as like -tags
       */
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

const getAllProblem=async (req,res) =>{
   try{
      //here we also use the .select() function 
      const getProblem = await Problem.find({}.select("_id title description tags difficulty")); //return a array 
   if(getProblem.length==0){
     return res.status(200).send(getProblem); 
   }
   }
   catch(err){
         res.status(500).send("Error: "+err);
   }
}
const getSolvedProblemByUser=async (req,res) =>{
  try{
   const count=req.result.problemSolved.length;
   res.status(200).send(count);
  }
   catch(err){
         res.status(500).send("Error: "+err);
   }
}

module.exports={CreateProblem,UpdateProblem,deleteProblem,getProblemById,getAllProblem,getSolvedProblemByUser};