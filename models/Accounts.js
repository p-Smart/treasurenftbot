const mongoose = require('mongoose')
const { Schema } = mongoose;

const detailConfig = {
    type: String,
}
const numberConfig = {
    type: Number,
    default: 0
}

const AccountsModel = new Schema({
    email: detailConfig,
    username: detailConfig,
    password: detailConfig,
    total_reserved: numberConfig,
    total_sell: numberConfig,
    reserve_pending: {
        type: Boolean,
        default: true
    },
    sell_pending: {
        type: Boolean,
        default: false
    }
  })

const Accounts = mongoose.models.Accounts ||  mongoose.model('Accounts', AccountsModel)

module.exports = Accounts