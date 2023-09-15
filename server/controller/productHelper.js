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
                else {
                    resolve({ invertryEmpty: false })
                }

            })
        }
        catch (err) {

        }
    },
    inventryManagement: (id, counts) => {          //*------inventry management need more updations-----//
        let Id=id.toString()
        let count = ((parseInt(counts)) * -1)
        try {
            return new Promise(async (resolve, reject) => {
                let pro = await productDb.findOne({ _id: new mongoose.Types.ObjectId(Id)})
                if (pro) {
                    let doc = await productDb.updateOne({ _id: new mongoose.Types.ObjectId(Id) }, { $inc: { quantity: count } })
                        .then(result => {
                            resolve()
                        })
                }
            })
        }
        catch (err) {

        }
    },
    searchProduct: (proName) => {
        console.log("here Pro:", proName);
        return new Promise(async (resolve, reject) => {
            try {
                let doc = await productDb.find({
                    $or:
                        [
                            { productname: { $regex: proName, $options: "i" } },
                            { category: { $regex: proName, $options: "i" } }
                        ]
                }).lean().then(product => {
                    resolve(product)
                })
            }
            catch (err) {
                reject(err)
            }
        })
    },
    checkInventry:(id)=>{
        try{
            return new Promise(async(resolve,reject)=>{
                let pro=await productDb.findOne({_id:id}).lean()
                if(pro.quantity<=0){
                    resolve({productEmpty:true})
                }
                else{
                    console.log(pro.quantity);
                    resolve()
                }
            })
        }
        catch(err){
            throw new Error(err)
        }
    },
    addCatOffer:(data)=>{
        let catOff=parseInt(data.catOffer)
        try{
            return new Promise(async(resolve,reject)=>{
                await productDb.updateMany({category:data.cat},{$set:{offer:catOff}},{setDefaultsOnInsert:true,upsert:true}).then(()=>{
                    resolve()
                })
            })
        }
        catch(err){
            throw new Error(err)
        }
    }
}