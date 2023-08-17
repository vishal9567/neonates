const mongoose = require('mongoose');


const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  products: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      }, 
      quantity: {
        type: Number,
        
      }
    }
  ]
})
const Cart = mongoose.model('carts', cartSchema);
module.exports = Cart;
