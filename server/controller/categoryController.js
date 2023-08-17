const categoryDb=require('../model/categoryModel')
const productDb=require('../model/productModel')

module.exports={
    create:(data)=>{
        return new Promise(async(resolve,reject)=>{
            let doc=await categoryDb.collection.insertOne({
                category:data.categoryname,
                status:true
            }).then(result=>{
                resolve(result)
            })
        })
    },
    getItems:()=>{
        return new Promise(async(resolve,reject)=>{
            let doc=await productDb.find().sort({date:-1}).lean()
            .then(products=>{
                resolve(products)
            })
        })
    },
    findCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            let doc=await categoryDb.find({status:true}).lean()
            .then(category=>{
                resolve(category)
            })
        })
    },
    findCatForTable:()=>{
        return new Promise(async(resolve,reject)=>{
            await categoryDb.find().lean()
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
    },
    enableOrDesableCat:(data,status)=>{
        if(status=="true"){
            return new Promise(async(resolve,reject)=>{
                let doc=await categoryDb.updateOne({_id:data},{$set:
                    {
                        status:false
                    }
                }).then(result=>{
                    resolve(result)
                })
            })
        }
        else if(status == "false"){
            return new Promise(async(resolve,reject)=>{
               let doc= await categoryDb.updateOne({_id:data},{$set:
                    {
                        status:true
                    }
                }).then(result=>{
                    resolve(result)
                })
            })
        }
        
    }
}