const productDb = require('../model/productModel')
const categoryController = require('../controller/categoryController')
const cropImg = require('../../config/imageCrop')
const fs = require('fs')

//------------------insert------------//
exports.create = async (req, res) => {
    // console.log(req.body);
    await cropImg.crop(req);
    let product = new productDb({
        productname: req.body.productname,
        brandname: req.body.brandname,
        category: req.body.category,
        color: req.body.color,
        price: req.body.price,
        quantity: req.body.quantity,
        discription: req.body.discription,
        image: [req.files[0].filename, req.files[1].filename]
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
    let product = await productDb.find().sort({ date: -1 }).lean()
        .then(products => {
            categoryController.findCategory().then(category => {
                res.render('admin/productlist', { products, category })
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
            categoryController.findCategory().then(category => {
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
        if (req.files.length === 0) {
            let doc = await productDb.updateOne({ _id: id }, {
                $set: {
                    productname: data.productname,
                    brandname: data.brandname,
                    category: data.category,
                    color: data.color,
                    price: data.price,
                    quantity: data.quantity,
                    discription: data.discription
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
                    res.render('user/errorPage', { error: err })
                })
        }
        else {
            let doc = await productDb.updateOne({ _id: id }, {
                $set: {
                    productname: data.productname,
                    brandname: data.brandname,
                    category: data.category,
                    color: data.color,
                    price: data.price,
                    quantity: data.quantity,
                    discription: data.discription,
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
                    res.render('user/errorPage', { error: err })
                })
        }

    }
    else
        res.redirect('/admin')
}
//*---------=====---delete one----=====---------//
exports.delete = async (req, res) => {
    const id = req.params.id
    const img = req.params.img.split(',')
    console.log(img);
    let doc = await productDb.deleteOne({ _id: id })
        .then(resolve => {
            for (let i = 0; i < img.length; i++) {
                try {
                    fs.unlink(('./public/images/' + img[i]), function (err) {
                        if (err) {
                            throw err
                        } else {
                            console.log("Successfully deleted the file.")
                        }
                    })
                }
                catch (err) {
                    console.log(err);
                }
            }
            res.redirect('/admin/listProduct')
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || `Can not delete by id:${id}`
            })
        })




    // for(let i=0;i<img.length;i++){
    //     fs.stat(('./public/images/'+img[i]), (err, stats) => {
    //         if (err) {
    //           console.error(err);
    //           return;
    //         }
    //         console.log('File size:', stats.size);
    //         console.log('Last modified:', stats.mtime);
    //       });
    // }      
}


