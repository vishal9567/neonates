const mongoose=require('mongoose')

let categorySchema=new mongoose.Schema({
    category:{
        type:String
    }
})

const categoryDb=mongoose.model('category',categorySchema)
module.exports=categoryDb;