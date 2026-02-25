const express=require ("express");
const axios = require("axios");

const router = express.Router();

router.post("/run", async (req, res) => {
  const { code } = req.body;

  try {
    const submit = await axios.post(
      "http://localhost:2358/submissions?wait=true",
      {
        source_code: code,
        language_id: 54   
      }
    );
    res.json(submit.data);

  } catch (err) {
    console.log(err.message);
    res.status(500).send("error");
  }
});

module.exports=router;