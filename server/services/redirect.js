const addcategory = require('../controller/categoryController')
const adminController = require('../controller/adminController')
const userController = require('../controller/userController')
const categoryController = require('../controller/categoryController')
const cartController = require('../controller/cartController');
const productHelpers=require('../controller/productHelper')
const orderController=require('../controller/orderController')


//*----------------user--------------------------------------------------user----------------------------------------------------------*//
exports.createUser = (req, res) => {
    userController.createUser(req.session.userData).then(result => {
        res.redirect('/userLogin')
    })
        .catch(err => {
            // res.send(400, "Not found")
            res.render('user/errorPage')
        })
}
exports.findUser = (req, res) => {
    let isUser;
    userController.validateUser(req.body).then(result => { 
        if (result) {
            req.session.user = true
            req.session.userId = result
            isUser=req.session.user
            // let totalQuantity=0;
            // if(req.session.grandTotal){
            //     totalQuantity=req.session.grandTotal[1]
            // }
            // else{
            //     totalQuantity=0;
            // }
            // cartController.getCartItemForLogin(result._id).then(result=>{
            //     let totalQuantity=0
            //     for(let i=0;i<result.products.length;i++){
            //         totalQuantity += result.products[i].quantity;
            //     }
            //     req.session.totalQuantityDuringLogin=totalQuantity;
            //     res.redirect('/')
            // })  
            res.redirect('/') 
        }

    })
        .catch((err) => {
            //res.send('User name or password incorrect or you are inactive')
            res.render('user/errorPage',{isUser})
        })
}
exports.UserRedirect = (req, res) => {
    console.log(req.body.otp);
    if (req.session.otpMob === req.body.otp) {
        userController.updateUserPassword(req.session.Email, req.session.newPassword)
            .then(result => {
                res.redirect('/')
            })
            .catch(reject => {
                //res.send("!Oops...")
                res.render('user/errorPage',{notEditpass:true})
            })
    }

}
exports.logOut = (req, res) => {
    req.session.destroy();
    res.redirect('/')
}
exports.addToCart = (req, res) => {
    let val = req.session.userId
    //let c= -1
    cartController.addToCart(req.params.id, val._id).then(result => {
        // productHelpers.inventryThenAddToCart(req.params.id,c).then(result=>{
        //     console.log("here comes call hurray!");
            
        // })
        res.json(true)
       
    })
        .catch(err => {
            console.log(err,"message from addtocart catch");
        })
}
exports.incrementItems = (req, res) => {
    console.log(req.body);
    ////productHelpers.inventry(req.body)
    cartController.incrementItems(req.body).then((response) => {
        res.json(response)
    }).catch(err => {
        // res.send(err)//show in error page
        res.render('user/errorPage')
    })
}
exports.addUserFormSubmit=(req,res)=>{                          //*=======it will redirect to the same page using ajax=======// 
    let userId = req.session.userId
    let data = req.body

    if (req.body.country == "")
        res.json({ validation: false })
    else if (req.body.state == "")
        res.json({ validation: false })
    else if (req.body.district == "")
        res.json({ validation: false })
    else if (req.body.city == "")
        res.json({ validation: false })
    else if (req.body.pinCode == "")
        res.json({ validation: false })
    else if (req.body.phone == "")
        res.json({ validation: false })
    else {
        console.log("current data:", data);
        userController.addAddress(userId, data).then(result => {
            res.json(result)
        })
    }
}
exports.getOrderDetails=async (req,res)=>{
    let user = req.session.userId
    let deliveryDetail=req.body //contains payment type total price address id
    //let cartData=req.session.cartItem
    let totalQty=req.session.grandTotal//contains totalqty total price
  
    await userController.getDeliveryAddress(user,deliveryDetail).then(async getAddress=>{//here getting the selected address
        // //req.session.deliveryAddress=result.address
       await cartController.getCartItemForLogin(user._id).then(async cartItem=>{//here getting the cart details such as product id and count
           await orderController.createOrder(getAddress,cartItem,deliveryDetail,totalQty,user.name).then(async result=>{
            await cartController.removeCart(user._id).then(result=>{
                res.json(true)
            })
           })
            
        })
    })
}
exports.deleteCartItem=(req,res)=>{
    let proId = req.body.count
    console.log("productid for delete cart item", proId);
    cartController.deleteCartItem(req.body).then(response => {
        res.json(response)
    }).catch(error => {
        // res.send(error)
        res.render('user/errorPage')
    })
}






//!----------------admin--------------------------------------------------admin----------------------------------------------------------*//

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/admin')
}
exports.addToCategory = (req, res) => {
    addcategory.create(req.body).then(result => {
        req.session.catCheck=result.cats
        res.redirect('/admin/addCategory')
    })
}
exports.dashboar = (req, res) => {
    res.redirect('/admin')
}
exports.catED = (req, res) => {
    let id = req.params.id
    let status = req.params.status
    categoryController.enableOrDesableCat(id, status).then(result => {
        res.redirect('/admin/categoryList')
    })
}
exports.userED = (req, res) => {
    let id = req.params.id
    let status = req.params.status
    userController.enableOrDesableUser(id, status).then(result => {
        req.session.destroy();
        res.redirect('/admin/userList')
    })
}
exports.changeStatus=(req,res)=>{
    console.log(req.body);
    let id=req.body.orderId;
    let status=req.body.orderStatus;
    orderController.changeOrderStatus(id,status).then(result=>{
        res.json(true)
    })
}
exports.cancelOrder=(req,res)=>{
    let id=req.body.orderId;
    let status=req.body.orderStatus;
    orderController.cacelStatus(id,status).then(result=>{
        res.json(true)
    }).catch(err=>{
        res.render('user/errorPage')
    })
}






// exports.dashboard = (req, res) => {
//     res.redirect('/admin')
// }


//-------------------adminlogin-----------//
// exports.findAdmin=(req,res)=>{
//     let data=req.body
//     adminController.findAdmin(req.body).then(result=>{
//         req.session.AdminLogIn=true;
//         res.redirect('/admin')
//     })
//     .catch(err=>{
//         res.send(500)
//     })
// }