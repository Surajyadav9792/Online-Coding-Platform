const axios=require('axios');//( npm i axios ) 
require('dotenv').config();

const getlanguageById=(lang)=>{
   const language={
     "c++":54,
     "java":62,
     "javascript":63
  }
return language[lang.toLowerCase()];

}
// by this submitBatch function we give submissionsBatch and this fuction gives token  
const submitBatch= async (submissions) =>{
 const options = {
  method: 'POST',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    base64_encoded: 'false'
  },
  headers: {
    'x-rapidapi-key': process.env.RAPID_API_KEY,
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: {
    submissions
  }
};

async function fetchData() {
  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
return await fetchData();
}

//here we access the token and send it  to judge0 for getting information
const submitToken = async(resultToken)=>{

  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      tokens: resultToken.join(","),
      base64_encoded: 'false',
      fields:'*'
    },
    headers: {
      'x-rapidapi-key': process.env.RAPID_API_KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    },
  };

  async function fetchData(){
    try{
      const response = await axios.request(options);
      return response.data;
    }catch(error){
      console.error(error.message);
      return null;
    }
  }

  // FIXED waiting (real delay)
  const waiting = (timer)=> new Promise(res=>setTimeout(res,timer));

  while(true){

    const result = await fetchData();

    if(!result) return null;

    // FIXED: status.id and correct condition
    const IsResultObtained =
      result.submissions.every(r => r.status.id > 2);

    // FIXED: return when DONE
    if(IsResultObtained){
      return result.submissions;
    }

    await waiting(1000);
  }
}

module.exports={getlanguageById,submitBatch,submitToken};


