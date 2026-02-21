
const Problem=require("../model/problem");
const Submission=require("../model/submission")
const {getlanguageById,submitBatch,submitToken}=require("../utils/fetch_language_id")
const submitCode=async (req,res) =>{
try{
 const userId=req.result._id;
 const problemId=req.params._id;

 const {code,language}=req.body;
 if(!userId||!problemId||!code||!language){
    return res.status().send("Some field is Missing");
 }

 //Fetch the problem from database
 const problem=await Problem.findById(problemId);

// first we store out submission then send it judge0 and after jugdge0 we update the submission
  const submittedResult=await Submission.create({
    userId,
    problemId,
    code,
    testCasesPassed:0,
    status:"pending",
    testCasesTotal:problem.hiddenTestCases.length
  })
  // now arrange the data i judge0 formate and send it to judge0

   // get language id for judge0
    const languageId=getlanguageById(language);

     const submissions=problem.hiddenTestCases.map((testcase)=>({
       source_code:code,
       language_id:languageId,
       stdin:testcase.input,
       expected_output:testcase.output 
    }));

    const submitResult=await submitBatch(submissions);

    const resultToken=submitResult.map((value)=>value.token);

     const testResult=await submitToken(resultToken);
    // console.log(testResult);

     //now we extract the information from testResult
    let testCasesPassed=0;
    let runtime=0;
    let memory=0;
    let status='accepted';
    let errorMessage='';
    
     for(const test of testResult){
        if(test.status_id==3){
            testCasesPassed++;
            runtime=runtime+parseFloat(test.time);
            memory=Math.max(memory,test.memory);
        }else{
            if(test.status_id==4){
                status='error';
                errorMessage=test.stderr
            }else{
                status='wrong'
                  errorMessage=test.stderr
            }
        }
     }
     //now we upadte and which is strone in our database
     submittedResult.status=status;
     submittedResult.testCasesPassed=testCasesPassed;
     submittedResult.errorMessage=errorMessage;
     submittedResult.runtime=runtime;
     submittedResult.memory=memory;

     await submittedResult.save();
     res.status(201).send(submittedResult);
}



catch(err){
    res.status(500).send("Internal server error: "+err);
}
}

module.exports=submitCode;