const mongoose=require('mongoose')

var coupenSchema=new mongoose.Schema({
    coupenName:{
        type:String
    },
    discount:{
        type:Number
    },
    expiry:{
        type:Date
    }
})
const coupenDb=mongoose.model('coupen',coupenSchema);
module.exports=coupenDb;