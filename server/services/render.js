const categoryController = require('../controller/categoryController')
const nodemailer = require("nodemailer");
const secret = require('../../config/secret');
const userController = require('../controller/userController');
const userdb = require('../model/userModel')
const productHelper = require('../controller/productHelper')
const cartController = require('../controller/cartController')
const orderController = require('../controller/orderController')



//?-------===============user============---------------=====================user===================-------------------------------------*//
exports.landing = (req, res) => {
    let user = req.session.user
    categoryController.findCategory()
        .then(category => {
            categoryController.getItems().then(product => {
                // res.render('user/landing', { product, category, user })
                res.render('user/secondLanding', { product, category, user, signup: true })
            })
        })
        .catch((err) => {
            // res.status(500).send({
            //     message: err.message || "Error Occurred while retriving"
            // })
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
    let userData = req.session.userData

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
exports.home = (req, res) => {
    let user = req.session.user
    categoryController.getItems().then(product => {
        categoryController.findCategory().then(category => {
            let TotalQuantity = 0;
            if (req.session.grandTotal) {
                TotalQuantity = req.session.grandTotal[1]
            }
            else {
                TotalQuantity = 0;
            }
            res.render('user/home', { signup: true, product, category, user, TotalQuantity })
        })
    })
}
exports.showProductDetail = (req, res) => {
    let id = req.params.id
    let user = req.session.user
    console.log(`this is user:${user}`);
    productHelper.showProductDetail(id).then(product => {
        categoryController.findCategory().then(category => {
            let TotalQuantity = 0;
            if (req.session.grandTotal) {
                TotalQuantity = req.session.grandTotal[1]
            }
            else {
                TotalQuantity = 0;
            }
            res.render('user/productPage', { signup: true, product, productDetail: true, user, category, TotalQuantity })
        })
    }).catch(err => {
        res.render('user/errorPage')
    })
}
exports.getCart = (req, res) => {
    let val = req.session.userId
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
            res.render('user/cartPage', { products, totalCount, grandTotal, cartIsEmty, user_id: val._id })
        }
        else {
            res.render('user/cartPage', { products, totalCount, grandTotal, user_id: val._id })
        }
    })
        .catch(err => {

        })
}
exports.addAddress = (req, res) => {                                     //*=====this add address will limit the address 2 for every user====//
    let userId = req.session.userId
    let data = req.body
    userController.addAddress(userId, data).then(result => {
        if (result.address) {
            let userId = req.session.userId
            res.render('user/userAddress', { email: userId.Email, dashboard: true, TotalPrice: req.session.grandTotal, ptag: true })
        }


    }).catch(err => {
        res.render('user/errorPage', { error: err })
    })
}
exports.proceedToCheckOut = (req, res) => {                                      //*========next stage of checkout is done using the user id fetching the cart details using session=====//
    let userId = req.session.userId
    let user = req.session.user
    if (userId.address) {                                                   //*========here will show html error while logout the session because id is neccessary, need to improve this stage====//
        console.log(userId.address);
        //got the next stage of check out
        ////let userId = req.session.userId
        let cartItem = req.session.cartItem
        let priceAndTotalCount = req.session.grandTotal[0]
        let addressZero = false;
        let addressOne = false;
        console.log(userId.address.length);
        if (userId.address.length === 0) {
            addressZero = true;
        }
        else if (userId.address.length === 1) {
            addressOne = true;
        }
        else{
            addressZero=false;
            addressOne=false;
        }

        userController.getCurrentUser(userId).then(result => {
            let address;
            let arr = result[0].address
            let TotalQuantity = 0;
            if (req.session.grandTotal) {
                TotalQuantity = req.session.grandTotal[1]
            }
            else {
                TotalQuantity = 0;
            }
            console.log(arr[0].country);
            for (let i = 0; i < result[0].address.length; i++) {
                address = result[0].address[i]

            }
            res.render('user/checkOut', { signup: true, userId, arr, cartItem, priceAndTotalCount, addressZero, addressOne, user, TotalQuantity })
        }).catch(err => {
            res.render('user/errorPage', { error: err })
        })
    }
    else {
        res.render('user/userAddress', { email: userId.Email, dashboard: true, TotalPrice: req.session.grandTotal })
    }
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
        ////console.log("it is products",data);
        categoryController.findCategory().then(category => {
            res.render('user/orderDetails', { signup: true, data, user, category, TotalQuantity: req.session.grandTotal[1] })
        })
    }).catch(err => {
        res.render('user/errorPage', { error: err, isUser: true })
    })
}
exports.userDashboard = (req, res) => {                   //*-------=========user account========------------//
    let user = req.session.userId
    //let cart=req.session.grandTotal
    orderController.getOrders(user._id).then(order => {
        categoryController.findCategory().then(category => {
            res.render('user/userDashBoard', { category, user, signup: true, dashboard: true, dash: true, orderCount: order.length, TotalQuantity: req.session.grandTotal[1] })
        })
    })
}
exports.userOrderList = (req, res) => {                 //*-----=========display the orderlist for user=========----//
    let user = req.session.userId
    orderController.getOrders(user._id).then(data => {
        categoryController.findCategory().then(category => {
            res.render('user/userOrder', { signup: true, data, user, TotalQuantity: req.session.grandTotal[1], category })
        })
    }).catch(err => {
        res.render('user/errorPage', { error: err })
    })
}
exports.addressBook=(req,res)=>{
    let user=req.session.user
    let userData=req.session.userDatas[0].address
    let userDetail=req.session.userDatas[0]
    let TotalQuantity = 0;
    if (req.session.grandTotal) {
        TotalQuantity = req.session.grandTotal[1]
    }
    else {
        TotalQuantity = 0;
    }
    let addressOne=false;
    let addresszero=false;
    if(userData.length === 1){
        addressOne=true;
    }
    else if(userData.length ===0){
        addresszero=true
    }
    res.render('user/addressBook',{user,signup:true,userData,addressOne,addresszero,TotalQuantity,userDetail})
}
exports.editAddress=(req,res)=>{
    req.session.addressId=req.body.addressId
    let user = req.session.userDatas[0]
    let deliveryDetail=req.body 
    userController.getDeliveryAddress(user,deliveryDetail).then(address=>{
        res.json({address:address.address});
    })
    .catch(err=>{
        res.render('user/errorPage')
    })
}



//?------===============admin============---------------======================admin===========================-----------------------------------*//
exports.homerout = (req, res) => {
    if (req.session.AdminLogIn) {
        categoryController.findCategory().then(category => {
            res.render('admin/dashboard', { category })
        })
            .catch((err) => {
                // res.status(500).send({
                //     message: err.message || "Error Occurred while retriving"
                // })
                res.render('user/errorPage')
            })
    }
    else
        res.render('admin/adminLogin')
}

// exports.productlist=(req,res)=>{
//    res.render('admin/productlist')
// }
exports.addproducts = (req, res) => {
    categoryController.findCategory().then(category => {
        res.render('admin/addProduct', { addProductPage: true, category })
    })
        .catch(err => {
            // res.status(500).send({
            //     message: err.message || "Error Occurred while retriving"
            // })
            res.render('user/errorPage')
        })

}
exports.addCategory = (req, res) => {
    let checkCat = req.session.catCheck
    res.render('admin/addCategory', { checkCat })
}
exports.userList = (req, res) => {
    userController.getUser().then(user => {
        categoryController.findCategory().then(category => {
            res.render('admin/userListTable', { user, category })
        })
    }).catch(err=>{
        res.render('user/errorPage')
    })
}
exports.categoryList = (req, res) => {
    categoryController.findCatForTable().then(cat => {
        categoryController.findCategory().then(category => {
            res.render('admin/categoryList', { cat, category })
        })
    }).catch(err=>{
        res.render('user/errorPage')
    })
}
exports.orderListTable = (req, res) => {
    // orderController.getOrderDetailsForAdmin().then(orderData=>{
    //     console.log(orderData);
    //     res.render('admin/orderList',{orderData})
    // })
    orderController.getOrderForTable().then(order => {
        console.log('this is order', order);
        res.render('admin/orderList', { order })
    }).catch(err => {
        res.render('user/errorPage', { error: err })
    })
}