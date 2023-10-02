const addcategory = require('../controller/categoryController')
const adminController = require('../controller/adminController')
const userController = require('../controller/userController')
const categoryController = require('../controller/categoryController')
const cartController = require('../controller/cartController');
const productHelpers = require('../controller/productHelper')
const orderController = require('../controller/orderController')
const coupenController = require('../controller/coupenController')
const bannerController = require('../controller/bannerController')
const productDb = require('../model/productModel')
const PDFDocument = require('pdfkit');
const blobStream = require('blob-stream');
const fs = require('fs');





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
    userController.validateUser(req.body).then(result => {
        if (result) {
            req.session.user = true
            req.session.userId = result
            isUser = req.session.user
            if (req.session.currentUrl) {
                console.log("url is", req.session.currentUrl);
                let url = req.session.currentUrl
                req.session.currentUrl = null;
                res.redirect(url)
            }
            else {
                console.log('call is here');
                res.redirect('/')
            }
        }
        else {
            res.render('user/userLogin', {signup:true, userNotValid: true })
        }

    })
        .catch((err) => {
            res.render('user/errorPage')
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
    productHelpers.checkInventry(req.params.id).then(data => {
        if (data) {
            console.log(data);
            res.json(data)
        } else {

            cartController.addToCart(req.params.id, val._id).then(result => {
                res.json({ cartAdded: true })
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
        res.json({ validation: true })
    else if (req.body.state == "")
        res.json({ validation: true })
    else if (req.body.district == "")
        res.json({ validation: true })
    else if (req.body.city == "")
        res.json({ validation: true })
    else if (req.body.pinCode == "")
        res.json({ validation: true })
    else if (req.body.phone == "")
        res.json({ validation: true })
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
    let flag = 0;
    if (!deliveryDetail.addressId || deliveryDetail.addressId == null) {
        res.json({ addressNotSelect: true })
    }
    else if (req.body.payType === 'wallet') {                                      //*----this if block only for wallet------//
        if (parseInt(req.body.total) <= req.session.userDatas[0].wallet) {
            await userController.getDeliveryAddress(user, deliveryDetail).then(async getAddress => {//here getting the selected address
                // //req.session.deliveryAddress=result.address
                await cartController.getCartItemForLogin(user._id).then(async cartItem => {//here getting the cart details such as product id and count
                    for (let i = 0; i < cartItem.products.length; i++) {
                        await productHelpers.inventryManagement(cartItem.products[i].item, cartItem.products[i].quantity).then(async info => {
                            if (info) {
                                flag = 1;
                                res.json(info)
                                console.log('this is info', info);
                            }
                        })
                    }
                    if (flag == 0) {
                        await orderController.createOrder(getAddress, cartItem, deliveryDetail, totalQty, user.name).then(async order => {
                            await cartController.removeCart(user._id).then(result => {
                                userController.updateWallet(user._id, parseInt(req.body.total) * -1).then(() => {
                                    res.json({ codSuccess: true })
                                })
                            })
                        })
                    }
                })
            }).catch(err => {
                throw new Error(err)
            })
        }
        else
            res.json({ insufficientWallet: true })
    }
    else if (req.body.payType === 'COD' || req.body.payType === 'Razorpay') {                                 //*-----this else block for both COD and online payment-----//
        await userController.getDeliveryAddress(user, deliveryDetail).then(async getAddress => {//here getting the selected address
            // //req.session.deliveryAddress=result.address
            await cartController.getCartItemForLogin(user._id).then(async cartItem => {//here getting the cart details such as product id and count
                for (let i = 0; i < cartItem.products.length; i++) {
                    await productHelpers.inventryManagement(cartItem.products[i].item, cartItem.products[i].quantity).then(async info => {
                        if (info) {
                            flag = 1;
                            res.json(info)
                            console.log('this is info', info);
                        }
                    })
                }
                if (flag == 0) {
                    await orderController.createOrder(getAddress, cartItem, deliveryDetail, totalQty, user.name).then(async order => {
                        await cartController.removeCart(user._id).then(result => {
                            if (req.body.payType === 'COD')
                                res.json({ codSuccess: true })
                            else {
                                let orderId = order.toString()
                                orderController.generateRazorPay(orderId, deliveryDetail.total).then(order => {
                                    res.json(order)
                                })
                            }
                        })
                    })
                }
            })
        }).catch(err => {
        })
    }
    else {
        res.json({ Notselect: true })
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
exports.getCoupon = (req, res) => {
    coupenController.getCouponForCart(req.query.price).then(coupon => {
        console.log(coupon);
        res.json(coupon)
    }).catch(err => {
        res.render('user/errorPage')
    })
}
exports.findCouponForCart = (req, res) => {
    coupenController.findCouponForCart(req.query).then(data => {
        res.json(data)
    }).catch(err => {
        res.render('user/errorPage')
    })
}
//find catergory products by ajax call
exports.getCatProducts = async (req, res) => {
    let count = await productDb.count()
    productHelpers.getCatProducts(req.query, count).then(product => {
        res.json(product)
    }).catch(err => {
        res.render('user/errorPage')
    })
}
exports.getPriceProducts = (req, res) => {
    productHelpers.getPriceProducts(req.query).then(product => {
        res.json(product)
    }).catch(err => {
        res.render('user/errorPage')
    })
}
exports.getColorProducts = (req, res) => {
    console.log(req.query);
    productHelpers.getColorProducts(req.query).then(product => {
        console.log("this is pro:", product);
        res.json(product)
    }).catch(err => {
        res.render('user/errorPage')
    })
}
exports.invoice = async (req, res) => {                         //*---=====invoice section====-----//
    //console.log('this is data',req.query);
    let product;
    let userData;
    await orderController.getOrderDetails(req.query.id).then(data => {
        //console.log("this is data",data);
        userData = data;
        product = data.map((item, i) => {
            return {
                quantity: parseInt(item.quantity),
                description: item.order.productname,
                price: parseInt(req.query.price),
                total: parseInt(item.order.price),
                "tax-rate": 0
            }
        })
        data = {
            sender: {
                "company": "Neonates",
                "address": "Kollam",
                "zip": "1234 AB",
                "city": "Kollam",
                "country": "India"
            },
            client: {
                "company": userData[0].name,
                "address": userData[0].address.state,
                "zip": "4567 CD",
                "city": userData[0].address.district,
                "country": userData[0].address.country
            },
            information: {
                // Invoice number
                "number": userData[0]._id,
                // Invoice data
                "date": userData[0].date,
                // Invoice due date
                //"due-date": "31-12-2021"
            },
            products: product,
            "bottom-notice": "Kindly pay your invoice within 15 days.",
            "settings": {
                "currency": "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.

            }
        };
        console.log(data);
        res.json(data)
    })
}
exports.likeProduct = async (req, res) => {             //*-----===add rating to each product if user is present===------//
    let user = req.session.userId
    if (user) {
        console.log('query', req.query);
        productHelpers.updateLike(user._id, req.query.proId, req.query.rating).then(() => {
            productHelpers.storeUpdate(req.query.proId).then(() => {
                res.json(true)
            })
        }).catch(err => {
            res.render('user/errorPage')
        })
    }
    else {
        res.json({ notLogged: true })
    }

}
exports.varifyPayment = (req, res) => {                    //*-------=====payment varification=============-------//
    orderController.verifyPayment(req.body).then(result => {
        orderController.changeStatusOfOrder(req.body.order.receipt).then(() => {
            res.json(true)
        }).catch(err => {
            res.render('user/errorPage')
        })
    }).catch(err => {
        res.render('user/errorPage')
    })
}


//!----------------admin--------------------------------------------------admin----------------------------------------------------------*//

exports.logout = (req, res) => {
    req.session.AdminLogIn = false;
    res.redirect('/admin')
}
exports.addToCategory = (req, res) => {
    if (req.body.categoryname == '') {
        res.json({ empty: true })
    }
    else {
        addcategory.create(req.body).then(result => {
            //req.session.catCheck = result.cats
            // res.redirect('/admin/addCategory')
            res.json(result)
        })
    }
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
exports.addCatOffer = (req, res) => {
    console.log(req.query);
    productHelpers.addCatOffer(req.query).then(() => {
        res.json(true)
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
exports.updateStatus = (req, res) => {
    console.log('status', req.query.status);
    console.log('status', req.query.id);
    console.log("welcome");
    orderController.updateStatus(req.query.id, req.query.status).then(() => {
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
}                                                                                 //*=======coupen section end===banner start====//
exports.createBanner = (req, res) => {
    console.log(req.body);
    bannerController.createBanner(req).then(() => {

    }).catch(err => {
        res.render('user/oopsPage')
    })
}
exports.salesReport = async (req, res) => {                                                  //*==========sales report===========//
    let orders = await orderController.getOrderDetailsForAdmin()
    console.log(orders);
    let salesData = []
    const PDFDocument = require('pdfkit');

    // Create a document
    const doc = new PDFDocument();

    // Pipe its output somewhere, like to a file or HTTP response
    // See below for browser usage
    doc.pipe(res);
    // Title
    doc.fontSize(20).text("Sales Report", { align: "center" });
    doc.moveDown();

    //row data
    orders.forEach((order, index) => {
        const quantity = order.Tquantity;
        const total = order.totalPrice;
        const discount = 0;
        const orderId = order._id;
        const date = order.date;

        salesData.push({
            index: index++,
            date,
            orderId,
            quantity,
            total,
            discount,
        });
    });

    // Add an image, constrain it to a given size, and center it vertically and horizontally
    // Define table headers
    const headers = [
        "Index",
        "Date",
        "Order Id",
        "Qnty",
        "Total",
        "Discount",
        "Final Price",
    ];
    // Calculate column widths
    const colWidths = [40, 60, 180, 50, 70, 70, 70];

    // Set initial position for drawing
    let x = 50;
    let y = doc.y;

    // Draw table headers
    headers.forEach((header, index) => {
        doc
            .font("Helvetica-Bold")
            .fontSize(12)
            .text(header, x, y, { width: colWidths[index], align: "left" });
        x += colWidths[index];
    });
    //draw table raw
    salesData.forEach((sale) => {
        x = 50;
        y += 20;

        const finalPrice = sale.total - sale.discount;


        // Create an array of row data with the Indian Rupee symbol and formatted prices
        const rowData = [
            sale.index,
            sale.date,
            sale.orderId,
            sale.quantity,
            sale.total, // Format total price
            sale.discount, // Format discount
            finalPrice, // Format final price
        ];

        // Draw row data
        rowData.forEach((value, index) => {
            doc.font("Helvetica").fontSize(12).text(value.toString(), x, y, {
                width: colWidths[index],
                align: "left",
            });
            x += colWidths[index];
        });
    });
    // Finalize PDF file
    doc.end();
}
