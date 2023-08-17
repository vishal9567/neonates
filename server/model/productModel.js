const mongoose=require('mongoose');
const { array } = require('../services/middleware/multer');

var productSchema=new mongoose.Schema({
    productname:{
        type:String
    },
    brandname:{
        type:String
    },
    category:{
        type:String
    },
    color:{
        type:String
    },
    price:{
        type:Number
    },
    quantity:{
        type:Number
    },
    discription:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now
    },
    image:{
        type:Array
    }
})
const productsDb=mongoose.model('products',productSchema);
module.exports=productsDb;