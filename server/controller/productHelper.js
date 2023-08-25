const productDb = require('../model/productModel')
const mongoose = require('mongoose')

module.exports = {
    showProductDetail: (id) => {  //?to che it is needed or not
        try {
            return new Promise(async (resolve, reject) => {
                let doc = await productDb.findOne({ _id: id }).lean().then(result => {
                    if (result) {
                        resolve(result);
                    }
                    else {
                        reject()
                    }
                })
            })
        }
        catch (err) {

        }
    },
    inventry: (body) => {
        let count = ((parseInt(body.count)) * -1)
        let productId = body.product
        console.log("product id is:", productId);
        try {
            return new Promise(async (resolve, reject) => {
                let pro = await productDb.findOne({ _id: new mongoose.Types.ObjectId(productId) })
                if (pro.quantity > 0) {
                    let doc = await productDb.updateOne({ _id: new mongoose.Types.ObjectId(productId) }, { $inc: { quantity: count } })
                        .then(result => {
                            resolve()
                        })
                }
                else{
                    resolve({invertryEmpty:false})
                }

            })
        }
        catch (err) {

        }
    },
    inventryThenAddToCart: (id,c,counts) => {          //?check whether it is necessary or not
        console.log("test for count",counts);
        
        let count = (counts !== null && counts !== undefined) ? parseInt(counts) : c;
        console.log(count);
        try {
            return new Promise(async (resolve, reject) => {
                let pro = await productDb.findOne({ _id: new mongoose.Types.ObjectId(id) })
                if (pro.quantity > 0) {
                    let doc = await productDb.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $inc: { quantity: count } })
                        .then(result => {
                            resolve(true)
                        })
                }
                else{
                    resolve({invertryEmpty:true})
                }

            })
        }
        catch(err){

        }
    },
    searchProduct:(proName)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let doc=await productDb.find({productname:proName}).lean().then(product=>{
                    resolve(product)
                })
            }
            catch(err){
                reject(err)
            }
        })
    }
}