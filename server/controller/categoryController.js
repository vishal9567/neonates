const categoryDb=require('../model/categoryModel')
const productDb=require('../model/productModel')

module.exports={
    create:(data)=>{
        return new Promise(async(resolve,reject)=>{
            let doc=await categoryDb.collection.insertOne({
                category:data.categoryname
            }).then(result=>{
                resolve(result)
            })
        })
    },
    getItems:()=>{
        return new Promise(async(resolve,reject)=>{
            let doc=await productDb.find().lean()
            .then(products=>{
                resolve(products)
            })
        })
    },
    findCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            let doc=await categoryDb.find().lean()
            .then(category=>{
                resolve(category)
            })
        })
    },
    findCategoryItems:(data)=>{
        return new Promise(async(resolve,reject)=>{
            let doc=await categoryDb.find({_id:data}).lean()
            .then(items=>{
                resolve(items)
            })
        })
    },
    findCategoryProduct:(data)=>{
        return new Promise(async(resolve,reject)=>{
            let doc=await productDb.find({category:data[0].category}).lean()
            .then(items=>{
                resolve(items)
            })
        })
    }
}