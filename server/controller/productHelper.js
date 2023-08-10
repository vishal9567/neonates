const productDb = require('../model/productModel')

module.exports={
    showProductDetail:(id)=>{
        try{
            return new Promise(async(resolve,reject)=>{
                let doc=await productDb.findOne({_id:id}).lean().then(result=>{
                    if(result){
                        resolve(result);
                    }
                    else{
                        reject()
                    }
                })
            })
        }
        catch(err){
            
        }
    }
}