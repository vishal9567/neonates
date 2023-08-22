const productDb = require('../model/productModel')
const categoryController=require('../controller/categoryController')
const cropImg=require('../../config/imageCrop')

//------------------insert------------//
exports.create = async(req, res) => {
    // console.log(req.body);
    await cropImg.crop(req);
    let product = new productDb({
        productname: req.body.productname,
        brandname: req.body.brandname,
        category: req.body.category,
        color: req.body.color,
        price: req.body.price,
        quantity: req.body.quantity,
        discription:req.body.discription,
        image: [req.files[0].filename,req.files[1].filename]
    })
    await product
        .save()
        .then(result => {
            res.redirect('/admin/addProductPage')

        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Error Occurred while retriving"
            })
        })
}
//-------------find()-----------//
exports.get = async (req, res) => {
    let product = await productDb.find().sort({date:-1}).lean()
        .then(products => {
                categoryController.findCategory().then(category=>{
                    res.render('admin/productlist', { products,category })
                })
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Error Occurred while retriving"
            })
        })
}
//-----------------find one------------//
exports.findone = async (req, res) => {
    const id = req.params.id
    let doc = await productDb.findOne({ _id: id }).lean()
        .then(products => {
            categoryController.findCategory().then(category=>{
                res.render('admin/addProduct', { updating: true, data: products, category })
            })
            
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Error can not find"
            })
        })
}
//-----------------updateone----------------//
exports.update = async (req, res) => {
    const id = req.params.id
    const data = req.body
    if (req.session.AdminLogIn) {
        let doc = await productDb.updateOne({ _id: id }, {
            $set: {
                productname: data.productname,
                brandname: data.brandname,
                category: data.category,
                color: data.color,
                price: data.price,
                quantity: data.quantity,
                discription:data.discription,
                image: [req.files[0].filename]

            }
        })
            .then(resolve => {
                // console.log(resolve);
                if (req.session.AdminLogIn)
                    res.redirect('/admin/listProduct')
                else
                    res.redirect('/admin')
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "Error Occurred while edit"
                })
            })
    }
    else
        res.redirect('/admin')
}
//*---------=====---delete one----=====---------//
exports.delete = async (req, res) => {
    const id = req.params.id
    let doc = await productDb.deleteOne({ _id: id })
        .then(resolve => {
            res.redirect('/admin/listProduct')
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || `Can not delete by id:${id}`
            })
        })
}


