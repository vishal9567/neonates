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
        type:String,
        default:function(){
            return this.realPrice-((this.realPrice * this.offer)/100)
        }
    },
    realPrice:{
        type:Number
    },
    offer:{
        type:Number,
        default:0
    },
    quantity:{
        type:Number
    },
    wishlistStatus:{
        type:Boolean
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