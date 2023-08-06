const categoryController = require('../controller/categoryController')
const nodemailer = require("nodemailer");
const secret=require('../../config/secret')
//const productDb=require('../model/productModel')

//*----------------user---------------------------------------------user----------------------------------------------------------------*//
exports.landing = (req, res) => {
    categoryController.findCategory()
        .then(category => {
            categoryController.getItems().then(product=>{
                res.render('user/landing',{product,category})
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
    categoryController.findCategoryItems(data).then(product => {
        let cat = product.category
        categoryController.findCategoryProduct(product).then(product => {
            categoryController.findCategory().then(category => {
                res.render('user/categoryPage', { product, category })
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
        else{
            res.render('user/otpcard')
            console.log("otp send");
        }
    })

}

//----------------------------------------------------------//
// exports.home = (req, res) => {
//     res.redirect('/')
// }

exports.signUp = (req, res) => {
    res.render('user/userSignUp')
}
exports.home = (req, res) => {
    categoryController.getItems().then(product => {
        res.render('user/home', { signup: true, product })
    })
}

// exports.dashboard=(req,res)=>{
//     res.render('admin/dashboard')
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
    res.render('admin/userListTable')
}
exports.categoryList=(req,res)=>{
    res.render('admin/categoryList')
}