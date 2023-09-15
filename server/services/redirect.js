const addcategory = require('../controller/categoryController')
const adminController = require('../controller/adminController')
const userController = require('../controller/userController')
const categoryController = require('../controller/categoryController')
const cartController = require('../controller/cartController');
const productHelpers = require('../controller/productHelper')
const orderController = require('../controller/orderController')
const coupenController = require('../controller/coupenController')



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
            isUser = req.session.user
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
            res.render('user/errorPage', { isUser })
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
                res.render('user/errorPage', { notEditpass: true })
            })
    }

}
exports.logOut = (req, res) => {
    req.session.user = null;
    req.session.userId = null;
    res.redirect('/')
}
exports.addToCart = (req, res) => {
    let val = req.session.userId
    productHelpers.checkInventry(req.params.id).then(data=>{
        if(data){
            console.log(data);
            res.json(data)
        }else{

            cartController.addToCart(req.params.id, val._id).then(result => {
                res.json({cartAdded:true})   
            })
                .catch(err => {
                    console.log(err, "message from addtocart catch");
                })
        }
    })
}
exports.addToWhishlist = (req, res) => {
    let val = req.session.userId
    userController.addToWhishlist(req.query, val._id).then(result => {
        res.json(true)
    }).catch(err => {
        res.render('user/errorPage')
    })
}
exports.backToCart = (req, res) => {
    let val = req.session.userId
    cartController.addToCart(req.query.proId, val._id).then(result => {
        userController.removeFromWishlist(req.query.proId, val._id).then(result => {
            res.json(true)
        })
    })
    console.log(val._id);
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
exports.addUserFormSubmit = (req, res) => {                          //*=======it will redirect to the same page using ajax=======// 
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
exports.getOrderDetails = async (req, res) => {                              //*-----collecting order details for checkout procedure---//
    let user = req.session.userId
    let deliveryDetail = req.body //contains payment type total price address id
    let totalQty = req.session.grandTotal//contains totalqty total price
    if (req.body.payType === 'wallet') {                                      //*----this if block only for wallet------//
        if (parseInt(req.body.total) <= req.session.userDatas[0].wallet) {
            await userController.getDeliveryAddress(user, deliveryDetail).then(async getAddress => {//here getting the selected address
                // //req.session.deliveryAddress=result.address
                await cartController.getCartItemForLogin(user._id).then(async cartItem => {//here getting the cart details such as product id and count
                    for (let i = 0; i < cartItem.products.length; i++) {
                        await productHelpers.inventryManagement(cartItem.products[i].item, cartItem.products[i].quantity)
                    }
                    await orderController.createOrder(getAddress, cartItem, deliveryDetail, totalQty, user.name).then(async order => {
                        await cartController.removeCart(user._id).then(result => {

                            userController.updateWallet(user._id, parseInt(req.body.total) * -1).then(() => {
                                res.json({codSuccess:true})
                            })

                        })
                    })

                })
            }).catch(err => {

            })
        }
        else
            res.json({ insufficientWallet: true })

    }
    else {                                                              //*-----this else block for both COD and online payment-----//
        await userController.getDeliveryAddress(user, deliveryDetail).then(async getAddress => {//here getting the selected address
            // //req.session.deliveryAddress=result.address
            await cartController.getCartItemForLogin(user._id).then(async cartItem => {//here getting the cart details such as product id and count
                for (let i = 0; i < cartItem.products.length; i++) {
                    await productHelpers.inventryManagement(cartItem.products[i].item, cartItem.products[i].quantity)
                }
                await orderController.createOrder(getAddress, cartItem, deliveryDetail, totalQty, user.name).then(async order => {
                    await cartController.removeCart(user._id).then(result => {
                        if (req.body.payType === 'COD')
                            res.json({ codSuccess: true })
                        else {
                            let orderId = order.toString()
                            orderController.generateRazorPay(orderId, totalQty[0]).then(order => {
                                res.json(order)
                            })
                        }
                    })
                })

            })
        }).catch(err => {

        })
    }
}
exports.deleteCartItem = (req, res) => {
    let proId = req.body.count
    console.log("productid for delete cart item", proId);
    cartController.deleteCartItem(req.body).then(response => {
        res.json(response)
    }).catch(error => {
        // res.send(error)
        res.render('user/errorPage')
    })
}
exports.submitEditAddress = (req, res) => {
    let addressId = req.session.addressId
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
        userController.updateAddress(addressId, data).then(result => {
            res.json({ validation: true })
        }).catch(err => {
            res.render('user/errorPage')
        })
    }
}
exports.deleteAddress = (req, res) => {
    let data = req.body
    userController.deleteAddress(data).then(() => {
        res.json(true)
    })
        .catch(err => {
            res.render('user/errorPage')
        })
}
exports.wallet = (req, res) => {
    let user = req.session.userDatas[0]
    console.log(user);
    res.json(user)
}
exports.getCoupon=(req,res)=>{
    coupenController.getCouponForCart(req.query.price).then(coupon=>{
        console.log(coupon);
        res.json(coupon)
    })
}
exports.findCouponForCart=(req,res)=>{
    coupenController.findCouponForCart(req.query).then(data=>{
        console.log('this is data',data);
        res.json(data)
    })
}




//!----------------admin--------------------------------------------------admin----------------------------------------------------------*//

exports.logout = (req, res) => {
    req.session.AdminLogIn = false;
    res.redirect('/admin')
}
exports.addToCategory = (req, res) => {
    addcategory.create(req.body).then(result => {
        req.session.catCheck = result.cats
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
        req.session.user = false;
        res.redirect('/admin/userList')
    })
}
exports.changeStatus = (req, res) => {
    console.log(req.body);
    let id = req.body.orderId;
    let status = req.body.orderStatus;
    let cancel = req.body.cancel
    orderController.changeOrderStatus(id, status, cancel).then(result => {
        res.json(true)
    })
}
exports.updateStatus=(req,res)=>{
    console.log('status',req.query.status);
    console.log('status',req.query.id);
    console.log("welcome");
    orderController.updateStatus(req.query.id,req.query.status).then(()=>{
        res.json(true);
    })
}
exports.cancelOrder = (req, res) => {
    let user = req.session.userId
    let id = req.body.orderId;
    let status = req.body.orderStatus;
    orderController.cacelStatus(id, status).then(result => {
        orderController.getSigleOrder(id).then(order => {
            userController.addToWallet(user._id, order).then(() => {

                res.json(true)
            })
        })
    }).catch(err => {
        res.render('user/errorPage')
    })
}
exports.createCoupon = (req, res) => {                                                 //*=====coupen section start===//
    coupenController.createCoupen(req.body).then(result => {
        req.session.coupen = result.coupen
        res.redirect('/admin/createCouponPage')
    }).catch(err => {
        res.render('user/errorPage')
    })
}
exports.editCoupon = (req, res) => {
    let id = req.params.id
    coupenController.updateCoupen(req.body, id).then(result => {
        res.redirect('/admin/coupenList')
    }).catch(err => {
        res.render('user/errorPage')
    })
}
exports.deleteCoupon = (req, res) => {
    let id = req.params.id
    coupenController.deleteCoupen(id).then(result => {
        res.redirect('/admin/coupenList')
    }).catch(err => {
        res.render('user/errorPage')
    })
}                                                                                 //*=======coupen section end//




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