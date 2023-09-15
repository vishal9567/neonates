const mongoose = require('mongoose')

var coupenSchema = new mongoose.Schema({
    coupenName: {
        type: String
    },
    discount: {
        type: Number
    },
    minimum: {
        type: Number
    },
    expiry: {
        type: Date
    },
    user: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId
            }
        }
    ]
})
const coupenDb = mongoose.model('coupen', coupenSchema);
module.exports = coupenDb;