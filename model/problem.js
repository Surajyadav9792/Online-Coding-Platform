const mongoose=require('mongoose');
const {Schema}=mongoose;

const problemSchema=new Schema({
  title:{
    type:String,
    required:true
  },
  difficulty:{
    type:String,
    enum:['easy','medium','hard'],
    required:true
  },
  explantion:{
    type:String,
    required:true
  },
 tags:[{
   type:String,
   enum:['array','DP','Linklist','graph','string'],
   required:true
 }],
  visibleTestCases:[
    {
        input:{
            type:String,
             required:true
        },
        output:{
             type:String,
             required:true
        },
        explantion:{
            type:String,
             required:true
        }
    }
  ],
   hiddenTestCase:[
      {
        input:{
            type:String,
             required:true
        },
        output:{
             type:String,
             required:true
        }
     }
  ],
  startCode:[
    {
        language:{
            type:String,
            required:true
        },
       initialCode:{
        type:String,
        required:true
       }
    }
  ],
  problemCreater:{
    type:Schema.Types.ObjectId,
    ref:'user',
    required:true
  }
},{
    timestamps:true
});

const problem=mongoose.model("Problem",problemSchema);

module.exports=problem;
