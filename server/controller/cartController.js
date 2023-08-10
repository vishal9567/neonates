const { ObjectId } = require('mongodb')
const cartDb=require('../model/cartModel')

module.exports={
    addToCart:(userId,productId)=>{
        try{
            return new Promise(async(resolve,reject)=>{
                let doc=await cartDb.find({userid:userId}).lean()
                if(doc){
                    console.log('welcome');
                }
                else{
                    let cartObj={
                        userid:userId,
                        productid:productId
                    }
                    cartDb.collection.insertOne(cartObj).then(result=>{
                        resolve(result)
                    })
                }
            })
        }
        catch(err){

        }
    }
}