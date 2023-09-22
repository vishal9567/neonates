const productDb = require('../model/productModel')
const mongoose = require('mongoose')

module.exports = {
    showProductDetail: (id) => {  //?to che it is needed or not
        try {
            return new Promise(async (resolve, reject) => {
                await productDb.findOne({ _id: id }).lean().then(result => {
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
                if (pro.quantity>=counts) {
                    await productDb.updateOne({ _id: new mongoose.Types.ObjectId(Id) }, { $inc: { quantity: count } })
                        .then(result => {
                            resolve()
                        })
                }
                else{
                    resolve({quantityEmpty:true,proname:pro.productname})
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
                await productDb.find({
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
    },
    getCatProducts:(cat)=>{
        try{
            return new Promise(async(resolve,reject)=>{
                await productDb.find({category:cat.cat}).lean().then(product=>{
                    resolve(product)
                })
            })
        }
        catch(err){
            throw new Error(err)
        }
    },
    getPriceProducts:(price)=>{
        let n1=parseInt(price.n1)
        let n2=parseInt(price.n2)
        console.log(n2,n1);
        try{
            return new Promise(async(resolve,reject)=>{
                await productDb.find({$and:[{realPrice:{$gt:n1}},{realPrice:{$lte:n2}}]}).lean() //*---===here price is string-=in schema price is string==---//
                .then(products=>{
                    resolve(products)
                })
            })
        }
        catch(err){
            throw new Error(err)
        }
    },
    getColorProducts:(color)=>{
        try{
            return new Promise(async(resolve,reject)=>{
                await productDb.find({color:color.color}).lean().then(product=>{
                    resolve(product)
                })
            })
        }
        catch(err){
            throw new Error(err)
        }
    },
    // updateLike:(userId,proId)=>{              //!----this idea is wrong change to right way----//
    //     try{
    //         return new Promise(async(resolve,reject)=>{
    //             await productDb.findOne({_id: new mongoose.Types.ObjectId(proId),user:userId}).then(async data=>{
    //                 console.log('this is like data',data);
    //                 if(data){
    //                     resolve({liked:true})
    //                 }
    //                 else{
    //                     await productDb.updateOne({_id: new mongoose.Types.ObjectId(proId)},{$push:{user:userId}}).then(async()=>{
    //                         await productDb.updateOne({_id: new mongoose.Types.ObjectId(proId)},{$inc:{rating:1}}).then(()=>{
    //                             resolve({rating:true})
    //                         })
    //                     })
    //                 }
    //             })
    //         })
    //     }
    //     catch(err){
    //         throw new Error(err)
    //     }
    // },
    updateLike:(userId,proId,rating)=>{
        let Rating=parseInt(rating)
        let obj={
            user:userId,
            rated:parseInt(rating)
        }
        try{
            return new Promise(async(resolve,reject)=>{
                let product=await productDb.findOne({_id: new mongoose.Types.ObjectId(proId)})
                console.log(product);
                if(product){
                    const userExist = product.rating.some(users=>users.user.toString()=== userId.toString())
                    if(userExist){
                        await productDb.updateOne(
                            {_id:new mongoose.Types.ObjectId(proId), 'rating.user': new mongoose.Types.ObjectId(userId)},
                            {$set:{'rating.$.rated':Rating}}
                        ).then(()=>{
                            resolve()
                        })
                    }
                    else{
                        await productDb.updateOne(
                            {_id:new mongoose.Types.ObjectId(proId)},
                            {$push:{rating:obj}}
                        ).then(()=>{
                            resolve()
                        })
                    }
                }
              
            })
        }
        catch(err){
            throw new Error(err)
        }
    },
    storeUpdate:(proId)=>{
        try{
            return new Promise(async(resolve,reject)=>{
                    let data=await productDb.aggregate([{$match:{"_id" : new mongoose.Types.ObjectId(proId)}},
                    {$project:{_id:0,count:{$size:'$rating'},totalvalue:{$sum:{$sum:'$rating.rated'}}}}])
                    console.log(data);

                    let actRating=parseInt(data[0].totalvalue)/parseInt(data[0].count)
                    await productDb.updateOne({_id:new mongoose.Types.ObjectId(proId)},{$set:{actualRating:actRating}})
                    resolve()
            })
        }
        catch(err){
            throw new Error(err)
        }
    }
}