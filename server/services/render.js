const categoryController = require('../controller/categoryController')
const nodemailer = require("nodemailer");
const secret = require('../../config/secret');
const userController = require('../controller/userController');
const userdb = require('../model/userModel')


//*----------------user---------------------------------------------user----------------------------------------------------------------*//
exports.landing = (req, res) => {
    let user=req.session.user
    categoryController.findCategory()
        .then(category => {
            categoryController.getItems().then(product => {
                res.render('user/landing', { product, category, user })
            })
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Error Occurred while retriving"
            })
        })

}
//-----------------catergory wise page rendering--------//
exports.categoryProduct = (req, res) => {
    let data = req.params.id
    let user=req.session.user
    categoryController.findCategoryItems(data).then(product => {
        let cat = product.category
        categoryController.findCategoryProduct(product).then(product => {
            categoryController.findCategory().then(category => {
                res.render('user/categoryPage', { product, category, user })
            })
        })
    })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Error Occured While Retriving"
            })
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
            req.session.Email=req.body.email
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
                .catch(message=>{
                    res.send("Netwok issue")
                })
        }
    },
    exports.forgotPassword = (req, res) => {
        res.render('user/forgotPassword')
    },
    exports.userLogin = (req, res) => {
        res.render('user/userLogin')
    }

//------------------------user signup----------------------------------//

exports.signUp = (req, res) => {
    res.render('user/userSignUp')
}
exports.home = (req, res) => {
    let user=req.session.user
    categoryController.getItems().then(product => {
        categoryController.findCategory().then(category => {
            res.render('user/home', { signup: true, product, category, user })
        })
    })
}

// exports.dashboard=(req,res)=>{
//     res.render('admin/dashboard')
// }
// exports.home = (req, res) => {
//     res.redirect('/')
// }




//*-----------------admin--------------------------------------------------admin--------------------------------------------------------*//
exports.homerout = (req, res) => {
    if (req.session.AdminLogIn) {
        categoryController.findCategory().then(category => {
            res.render('admin/dashboard', { category })
        })
            .catch((err) => {
                res.status(500).send({
                    message: err.message || "Error Occurred while retriving"
                })
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
            res.status(500).send({
                message: err.message || "Error Occurred while retriving"
            })
        })

}
exports.addCategory = (req, res) => {
    res.render('admin/addCategory')
}
exports.userList = (req, res) => {
    userController.getUser().then(user => {
        categoryController.findCategory().then(category => {
            res.render('admin/userListTable', { user, category })
        })
    })
}
exports.categoryList = (req, res) => {
    categoryController.findCatForTable().then(cat => {
        categoryController.findCategory().then(category => {
            res.render('admin/categoryList', { cat, category })
        })
    })
}