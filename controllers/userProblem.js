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

module.exports=CreateProblem;