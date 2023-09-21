const categoryController = require('../controller/categoryController')
const nodemailer = require("nodemailer");
const secret = require('../../config/secret');
const userController = require('../controller/userController');
const userdb = require('../model/userModel')
const productHelper = require('../controller/productHelper')
const cartController = require('../controller/cartController')
const orderController = require('../controller/orderController')
const productDb = require('../model/productModel')
const coupenController = require('../controller/coupenController')
const bannerController = require('../controller/bannerController')
const orderDb = require('../model/ordersModel')
const catDb=require('../model/categoryModel')
const couponDb=require('../model/coupenModel')




//?-------===============user============---------------=====================user===================-------------------------------------*//
exports.landing = async (req, res) => {
    let count = await productDb.count()
    let user = req.session.user
    let proSearch = `${req.session.searchPro}`
    const perPage = 4;
    let pages = Math.ceil((count / perPage))
    let page = parseInt(req.query.page) || 1;
    categoryController.findCategory()
        .then(category => {
            categoryController.getItems(perPage, page).then(products => {
                // res.render('user/landing', { product, category, user })
                //res.render('user/secondLanding', { product, category, user, signup: true, page, perPage, pages })

                console.log("check search", proSearch);
                if (typeof req.session.searchPro == undefined || req.session.searchPro == null) {
                    product = products
                    console.log("this is produect", product);
                    res.render('user/secondLanding', { signup: true, product, category, user, page, perPage, pages })
                }
                else {
                    productHelper.searchProduct(proSearch).then(pro => {
                        if (pro) {
                            product = pro
                            res.render('user/secondLanding', { signup: true, product, category, user, page, perPage, pages })
                            req.session.searchPro = null;
                        }

                    })
                }
            })
        })
        .catch((err) => {
            res.render('user/errorPage')
        })

}
//-----------------catergory wise page rendering--------//
exports.categoryProduct = (req, res) => {
    let data = req.params.id
    let user = req.session.user
    categoryController.findCategoryItems(data).then(product => {
        let cat = product.category
        categoryController.findCategoryProduct(product).then(product => {
            categoryController.findCategory().then(category => {
                //res.render('user/categoryPage', { product, category, user })
                res.render('user/categoryPages', { product, category, user, signup: true })
            })
        })
    })
        .catch(err => {
            // res.status(500).send({
            //     message: err.message || "Error Occured While Retriving"
            // })
            res.render('user/errorPage')
        })
}
//-----------------nodemailer--------------------//
exports.userSignup = (req, res) => {
    req.session.userData = req.body
    //let userData = req.session.userData
    otp = Math.floor(1000 + Math.random() * 9000).toString()
    req.session.otp = otp
    console.log(otp);
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: secret.email,
            pass: secret.password
        }
    })
    var mailObj = {
        from: 'easyedavsm@gmail.com',
        to: req.body.email,
        subject: 'Neonates otp varification',
        text: `Thank you for choosing Neonates. Use the following OTP to complete your Sign Up procedures. ${otp} `
    }
    transport.sendMail(mailObj, async (err, status) => {
        if (err) {
            console.log('Err', err)
            res.render('user/errorPage')
        }
        else {
            res.render('user/otpcard')
            console.log("otp send");
        }
    })

},
    exports.sendTwillio = async (req, res) => {
        let userExist = await userdb.findOne({ Email: req.body.email })
        if (userExist) {
            otp = Math.floor(1000 + Math.random() * 9000).toString()
            console.log(otp);
            req.session.newPassword = req.body.password;
            req.session.Email = req.body.email
            req.session.otpMob = otp;
            req.session.mobNumber = req.body.mobNumber;
            const accountSid = secret.TWILIO_SID;
            const authToken = secret.TWILIO_AUTH_TOKEN;
            const client = require('twilio')(accountSid, authToken);
            client.messages
                .create({
                    body: `Otp to reset your password is ${otp}`,
                    to: '+91' + req.body.mobNumber,
                    from: '+12059316839'
                })
                .then((message) => {
                    console.log("otp send");
                    res.render('user/mobOtpCard')
                })
                .catch(message => {
                    // res.send("Netwok issue")
                    res.render('user/errorPage', { networkIssue: true })
                })
        }
    },
    exports.forgotPassword = (req, res) => {
        res.render('user/forgotPassword')
    },
    exports.userLogin = (req, res) => {
        res.render('user/userLogin')
    }

//*------------------------user signup----------------------------------//

exports.signUp = (req, res) => {
    res.render('user/userSignUp')
}
exports.home = async (req, res) => {
    let count = await productDb.count()
    // let doc=req.session.TotalProduct
    let user = req.session.user
    const perPage = 4;
    let pages = Math.ceil((count / perPage))
    let page = parseInt(req.query.page) || 1;
    categoryController.getItems(perPage, page).then(product => {
        categoryController.findCategory().then(category => {
            let TotalQuantity = 0;
            if (req.session.grandTotal) {
                TotalQuantity = req.session.grandTotal[1]
            }
            else {
                TotalQuantity = 0;
            }
            res.render('user/home', { signup: true, product, category, user, TotalQuantity, page, perPage, pages })

        })
    })
}
exports.productSearch = (req, res) => {  //!---product search----//
    console.log('product', req.body.Item);
    req.session.searchPro = req.body.Item
    res.json(true)

}
exports.showProductDetail = async (req, res) => {
    let id = req.params.id
    let user = req.session.user
    let banner;
    ////  console.log(`this is user:${user}`);
    await bannerController.getBanner().then(ban => {
        console.log(ban);
        banner = ban;
    })
    productHelper.showProductDetail(id).then(product => {
        categoryController.findCategory().then(category => {
            let TotalQuantity = 0;
            if (req.session.grandTotal) {
                TotalQuantity = req.session.grandTotal[1]
            }
            else {
                TotalQuantity = 0;
            }
            res.render('user/productPage', { signup: true, product, productDetail: true, user, category, TotalQuantity, banner })
        })
    }).catch(err => {
        res.render('user/errorPage')
    })
}
exports.getCart = (req, res) => {
    let val = req.session.userId
    let productNotAvailable = true;
    cartController.getCartProducts(val._id).then(product => {
        let totalCount = 0;
        let grandTotal = 0;
        for (i of product) {
            totalCount += i.quantity
            grandTotal += ((i.quantity) * i.product.price)
        }
        req.session.grandTotal = [grandTotal, totalCount]
        ////console.log(product[0].user);
        let products = product
        req.session.cartItem = product
        console.log(products);
        if (products.length === 0) {                                   //*--===check whether cart is empty or not==--//
            let cartIsEmty = true;
            productNotAvailable = false;
            res.render('user/cartPage', { signup: true, products, totalCount, grandTotal, cartIsEmty, user_id: val._id, user: val._id })
        }
        else {
            productNotAvailable = false;
            res.render('user/cartPage', { signup: true, products, totalCount, grandTotal, user_id: val._id, user: val._id })
        }
    })
        .catch(err => {
            res.render('user/cartPage', { signup: true, productNotAvailable })
        })
}
exports.addAddress = (req, res) => {                                     //*=====this add address will limit the address 2 for every user====//
    let userId = req.session.userId
    let data = req.body
    console.log(data);
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
        userController.addAddress(userId, data).then(result => {
            res.json({ validation: true })
        }).catch(err => {
            res.render('user/errorPage')
        })
    }
    
}
exports.proceedToCheckOut = async (req, res) => {                                      //*========next stage of checkout is done using the user id fetching the cart details using session=====//
    console.log("this is query:", req.query);
    if (req.query.coupon) {
        await coupenController.pushUserToCoupon(req.query)
    }
    let userId = req.session.userId
    let user = req.session.user
    let discountDetail = req.query;
        let cartItem = req.session.cartItem
        let priceAndTotalCount = req.session.grandTotal[0]
        userController.getCurrentUser(userId).then(result => {
            let arr = result[0].address?result[0].address:false;
            let TotalQuantity = 0;
            if (req.session.grandTotal) {
                TotalQuantity = req.session.grandTotal[1]
            }
            else {
                TotalQuantity = 0;
            }
           
            res.render('user/checkOut', { signup: true, userId, arr, cartItem, priceAndTotalCount, user, TotalQuantity, discountDetail })
        }).catch(err => {
            res.render('user/errorPage', { error: err })
        })
    
    
}
exports.addAdddress2 = (req, res) => {
    let userId = req.session.userId
    res.render('user/userAddress2', { email: userId.Email, dashboard: true })
}
exports.showProductsForuser = (req, res) => {               //*-------========show order details for user=======----//
    let id = req.params.id
    let user = req.session.userId.name
    let firstLetter = user.charAt(0)
    orderController.getOrderDetails(id).then(data => {
        let user = req.session.user
        console.log("it is products", data);
        categoryController.findCategory().then(category => {
            let TotalQuantity = 0;
            if (req.session.grandTotal) {
                TotalQuantity = req.session.grandTotal[1]
            }
            else {
                TotalQuantity = 0;
            }
            res.render('user/orderDetails', { signup: true, data, user, category, TotalQuantity })
        })
    }).catch(err => {
        res.render('user/errorPage', { error: err, isUser: true })
    })
}
exports.userDashboard = async (req, res) => {                   //*-------=========user account========------------//
    let user = req.session.userDatas[0]
    let count = await orderDb.find({ userid: user._id }).count()
    console.log(user);
    let TotalQuantity = 0;
    if (req.session.grandTotal) {
        TotalQuantity = req.session.grandTotal[1]
    }
    else {
        TotalQuantity = 0;
    }
    categoryController.findCategory().then(category => {
        res.render('user/userDashBoard', { category, user, signup: true, dashboard: true, dash: true, orderCount: count, TotalQuantity })
    })
}
exports.userOrderList = async (req, res) => {                 //*-----=========display the orderlist for user=========----//
    let user = req.session.userId
    let count = await orderDb.find({ userid: user._id }).count()
    const perPage = 4;
    let pages = Math.ceil((count / perPage))
    let page = parseInt(req.query.page) || 1;
    orderController.getOrders(user._id, perPage, page).then(data => {
        categoryController.findCategory().then(category => {
            let TotalQuantity = 0;
            if (req.session.grandTotal) {
                TotalQuantity = req.session.grandTotal[1]
            }
            else {
                TotalQuantity = 0;
            }
            res.render('user/userOrder', { signup: true, data, user, TotalQuantity, category, pages })
        })
    }).catch(err => {
        res.render('user/errorPage', { error: err })
    })
}
exports.filterOrder = (req, res) => {
    let user = req.session.userId
    if (req.query.status == 2) {
        console.log(req.query);

    }
    orderController.filterOrder(user._id, req.query.status).then((order) => {
        console.log(order);
        res.json(order)
    }).catch(err => {
        res.render('user/errorPage')
    })
}
exports.addressBook = (req, res) => {
    let user = req.session.user
    let userData = req.session.userDatas[0].address
    let userDetail = req.session.userDatas[0]
    let TotalQuantity = 0;
    if (req.session.grandTotal) {
        TotalQuantity = req.session.grandTotal[1]
    }
    else {
        TotalQuantity = 0;
    }
    let addressOne = false;
    let addresszero = false;
    if (userData) {
        if (userData.length === 1) {
            addressOne = true;
        }
        else if (userData.length === 0) {
            addresszero = true
        }
    }
    else
        addresszero = true;

    res.render('user/addressBook', { user, signup: true, userData, addressOne, addresszero, TotalQuantity, userDetail })
}
exports.editAddress = (req, res) => {
    req.session.addressId = req.body.addressId
    let user = req.session.userDatas[0]
    let deliveryDetail = req.body
    userController.getDeliveryAddress(user, deliveryDetail).then(address => {
        res.json({ address: address.address });
    })
        .catch(err => {
            res.render('user/errorPage')
        })
}
exports.showWishlist = (req, res) => {
    let user = req.session.userDatas[0]
    if (user.wishlist) {
        res.render('user/wishlist', { user ,signup:true, common:true})
    }
    else {
        res.render('user/wishlist', { wishlisEmpty: true ,signup:true,common:true})
    }
}
exports.getWalletHistory=(req,res)=>{
    let user = req.session.userId
    const perPage = 2;
    let page = parseInt(req.query.page) || 1;
    userController.getWalletHistory(user._id,perPage,page).then((data)=>{
        let pages = Math.ceil((data.count.length / perPage))
        console.log('this is wallet',data.history);
        res.render('user/walletHistory',{signup:true,history:data.history,user,pages})
    }).catch(err=>{
        res.render('user/errorPage')
    })
}







//?------===============admin============---------------======================admin===========================-----------------------------------*//
exports.homerout = async(req, res) => {
    if (req.session.AdminLogIn) {
        let data=await  orderController.getForChart()
        console.log(data);
        data=JSON.stringify(data)
        categoryController.findCategory().then(category => {
            res.render('admin/dashboard', { category,data })
        })
            .catch((err) => {
                res.render('user/errorPage')
            })
    }
    else
        res.render('admin/adminLogin')
}

exports.addproducts = (req, res) => {
    categoryController.findCategory().then(category => {
        res.render('admin/addProduct', { addProductPage: true, category,added:req.session.addProduct })
    })
        .catch(err => {
            res.render('user/errorPage')
        })

}
exports.addCategory = (req, res) => {
    let checkCat = req.session.catCheck
    res.render('admin/addCategory', { checkCat })
    req.session.catCheck = null;
}
exports.userList = async(req, res) => {
    let count=await userdb.find().count()
    const perPage=5;
    let pages = Math.ceil((count / perPage))
    let page=parseInt(req.query.page) || 1;
    userController.getUser(perPage,page).then(user => {
        categoryController.findCategory().then(category => {
            res.render('admin/userListTable', { user, category,pages })
        })
    }).catch(err => {
        res.render('user/errorPage')
    })
}
exports.categoryList = async(req, res) => {
    let count=await catDb.find().count()
    const perPage=5;
    let pages = Math.ceil((count / perPage))
    let page=parseInt(req.query.page) || 1;
    categoryController.findCatForTable(perPage,page).then(cat => {
        categoryController.findCategory().then(category => {
            res.render('admin/categoryList', { cat, category,pages })
        })
    }).catch(err => {
        res.render('user/errorPage')
    })
}
exports.orderListTable = async(req, res) => {
    let count=await orderDb.find().count()
    const perPage=5;
    let pages = Math.ceil((count / perPage))
    let page=parseInt(req.query.page) || 1;
    orderController.getOrderForTable(perPage,page).then(order => {
        categoryController.findCategory().then(category => {
            res.render('admin/orderList', { order, category,pages })
        })
    }).catch(err => {
        res.render('user/errorPage', { error: err })
    })
}
exports.coupenList = async(req, res) => {
    let count=await couponDb.find().count()
    const perPage=5;
    let pages = Math.ceil((count / perPage))
    let page=parseInt(req.query.page) || 1;
    coupenController.getCoupen(perPage,page).then(coupen => {
        categoryController.findCategory().then(category => {

            if (coupen) {
                res.render('admin/coupenList', { coupen, category,pages })
            }
            else {
                res.render('admin/coupenList', { nocoupen: coupen.notCoupen })
            }
        })
    }).catch(err => {
        res.render('user/errorPage')
    })
}
exports.createCouponPage = (req, res) => {
    let coupenCheck = req.session.coupen
    res.render('admin/createCoupon', { coupenCheck })
    req.session.coupen = null;
}
exports.editCouponPage = (req, res) => {
    let id = req.params.id
    coupenController.getOneCoupon(id).then(coupon => {
        res.render('admin/createCoupon', { coupon, updating: true })
        console.log(coupon);
    })
}
exports.showOrderDetail = (req, res) => {
    let id = req.params.id
    orderController.getOrderDetails(id).then(data => {
        let user = req.session.user
        console.log("it is products", data);
        categoryController.findCategory().then(category => {
            let TotalQuantity = 0;
            if (req.session.grandTotal) {
                TotalQuantity = req.session.grandTotal[1]
            }
            else {
                TotalQuantity = 0;
            }
            res.render('admin/orderDetail', { data, category, TotalQuantity })
        })
    }).catch(err => {
        res.render('user/errorPage', { error: err, isUser: true })
    })
}
exports.filterOrderForAdmin = (req, res) => {
    orderController.filterOrderForAdmin(req.query.status).then((order) => {
        //console.log(order);
        res.json(order)
    }).catch(err => {
        res.render('user/errorPage')
    })
}
exports.addBanner = (req, res) => {
    res.render('admin/addBanner')
}