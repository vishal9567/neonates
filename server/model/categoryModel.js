const mongoose=require('mongoose')

let categorySchema=new mongoose.Schema({
    category:{
        type:String
    },
    status:{
        type:Boolean,
        dafault:true
    }
})
const categoryDb=mongoose.model('category',categorySchema)
module.exports=categoryDb;