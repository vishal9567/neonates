const cartController = require("../../controller/cartController");


module.exports={
    cartCount:(req,res,next)=>{
        let val = req.session.userId
        if(val){
            cartController.getCartProducts(val._id).then(product => {       
                let totalCount = 0;
                let grandTotal = 0;
                for (i of product) {
                    totalCount += i.quantity
                    grandTotal += ((i.quantity) * i.product.price)
                }
                req.session.grandTotal=[grandTotal,totalCount]
                next();
            })
        }
        else{
            next();
        }
    }
}