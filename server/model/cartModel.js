const mongoose=require('mongoose')

let cartSchema=new mongoose.Schema({
    userid:{
        type:String
    },
    productid:[
        {type:mongoose.Schema.Types.ObjectId}
      ]   
    ,
    quantity:{
        type:String
    }
})
const cartDb=mongoose.model('cart',cartSchema);
module.exports=cartDb;