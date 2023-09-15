const mongoose=require('mongoose');

var bannerSchema=new mongoose.Schema({
    name:{
        type:String
    },
    expiry:{
        type:Date
    },
    image:{
        type:Array
    }
})
const bannerDb=mongoose.model('banner',bannerSchema);
module.exports=bannerDb;