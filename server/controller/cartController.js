const { ObjectId } = require('mongodb')
const Cart = require('../model/cartModel')
const productDb = require('../model/productModel')
const mongoose = require('mongoose')
const productHelper = require('../controller/productHelper')


module.exports = {
  // addToCart: (userId, productId) => {
  //     try {
  //         return new Promise(async (resolve, reject) => {
  //             let doc = await cartDb.findOne({ userid:userId }).lean()
  //                if(doc){
  //                 await cartDb.updateOne({ userid:userId }, { $push: { productid:new mongoose.Types.ObjectId(productId) } })
  //                 .then(result=>{
  //                     resolve(result)
  //                 })
  //                }
  //                else{
  //                 let cartObj = {
  //                     userid:userId,
  //                     productid:[ new mongoose.Types.ObjectId(productId)]
  //                 }
  //                 cartDb.collection.insertOne(cartObj).then(result => {
  //                     resolve(result)
  //                 })
  //                }

  //         })
  //     }
  //     catch (err) {

  //     }
  // },
  addToCart: (proId, userId) => {
    let proObj = {
      item: proId,
      quantity: 1
    }
    return new Promise(async (resolve, reject) => {
      console.log(userId, "addtocart");
      try {
        let userCart = await Cart.findOne({ user: userId });
        if (userCart) {
          console.log(userCart, "usercart");
          try {
            const proExist = userCart.products.some(product => product.item.toString() === proId.toString());
            console.log(proExist, "proexisst");

            if (proExist) {

              await Cart.updateOne(
                { user: (userId), 'products.item': proId },
                {
                  $inc: { 'products.$.quantity': 1 }
                }
              ).then(() => {
                resolve()
              })
                .catch((err) => {
                  console.error(err);
                })
            }
            else {
              await Cart.updateOne(
                { user: userId },
                {
                  $push: { products: proObj }
                }
              )
                .then(() => {
                  resolve()
                })
                .catch((err) => {
                  console.error(err);
                })
            }
          } catch (error) {
            console.log("Failed to update cart:", error);
            reject(error);
          }
        }
        else {
          let cartObj = {
            user: userId,
            products: [proObj]
          };
          let newCart = new Cart(cartObj);
          await newCart.save();
          resolve();
        }
      } catch (error) {
        console.log("Failed to add to cart:", error);
        reject(error);
      }
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const cartItems = await Cart.aggregate([
          {
            $match: { user: mongoose.Types.ObjectId.createFromHexString(userId) }
          },
          {
            $unwind: '$products'
          },
          {
            $project: {
              user: "$user",
              item: '$products.item',
              quantity: '$products.quantity'
            }
          },
          {
            $lookup: {
              from: 'products',
              localField: 'item',
              foreignField: '_id',
              as: 'product'
            }
          },
          {
            $project: {
              user: 1, item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
            }
          },
        ]).exec();
        resolve(cartItems);
      } catch (error) {
        reject(error);
      }
    });
  },
  incrementItems: (body) => {
    console.log("here is the incdec count", body);
    let count = parseInt(body.count)
    let quantity = parseInt(body.quantity)
    try {
      return new Promise(async (resolve, reject) => {
        let doc = await Cart.findOne({ _id: new mongoose.Types.ObjectId(body.cart) })
        if (doc) {
          console.log(doc);
          if (count == -1 && quantity == 1) {
            await Cart.updateOne(
              { _id: new mongoose.Types.ObjectId(body.cart) },
              { $pull: { products: { item: new mongoose.Types.ObjectId(body.product) } } }
            ).then(response => {
              resolve({ removeProduct: true })
            })
          }
          else {
            await Cart.updateOne(
              { 'products.item': new mongoose.Types.ObjectId(body.product), _id: new mongoose.Types.ObjectId(body.cart) },
              {
                $inc: { 'products.$.quantity': count }
              }
            ).then(() => {
              resolve(true)
            })
          }

        }
      })
    }
    catch (err) {
      reject("Data not found")
    }
  },
  deleteCartItem: (body) => {
    let id = body.product
    let count = body.count
    let c = -1
    try {
      return new Promise(async (resolve, reject) => {
        let doc = await Cart.findOne({ _id: new mongoose.Types.ObjectId(body.cart) })
        if (doc) {
          await Cart.updateOne({ _id: new mongoose.Types.ObjectId(body.cart) },
            { $pull: { products: { item: new mongoose.Types.ObjectId(body.product) } } }
          ).then(async response => {
            // await productHelper.inventryThenAddToCart(id,c,count).then(() => {

            // })
            resolve({ deleteProduct: true })

          })
        }
      })
    }
    catch (err) {
      reject("Cart is empty")
    }
  },
  getCartItemForLogin: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        let doc = await Cart.findOne({ user: id }).lean().then(result => {
          resolve(result)
        })
      }
      catch (err) {

      }
    })
  },
  removeCart: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        let doc = await Cart.deleteOne({ user: new mongoose.Types.ObjectId(id) }).then(result => {
          resolve(result)
        })
      }
      catch (err) {

      }
    })
  }

}
