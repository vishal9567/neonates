const categoryDb=require('../model/categoryModel')
const productDb=require('../model/productModel')

module.exports={
    create:(data)=>{
        let categoryName=(data.categoryname).toUpperCase();
        return new Promise(async(resolve,reject)=>{
            let checkCat=await categoryDb.findOne({category:categoryName}).lean()
            if(checkCat){
                resolve({cats:true})
            }
            else{
                await categoryDb.collection.insertOne({
                    category:categoryName,
                    status:true
                }).then(result=>{
                    resolve(result)
                })
    
            }
        })
    },
    getItems:(perPage,page)=>{
        return new Promise(async(resolve,reject)=>{
            await productDb.find().sort({date:-1}).skip(perPage * page -perPage).limit(perPage).lean()
            .then(products=>{
                resolve(products)
            })
        })
    },
    findCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            await categoryDb.find({status:true}).lean()
            .then(category=>{
                resolve(category)
            })
        })
    },
    findCatForTable:(perPage,page)=>{
        return new Promise(async(resolve,reject)=>{
            await categoryDb.find().skip(perPage*page - perPage).limit(perPage).lean()
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