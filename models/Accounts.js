const mongoose = require('mongoose')
const { Schema } = mongoose;

const detailConfig = {
    type: String,
}
const numberConfig = {
    type: Number,
    default: 0
}
const dateConfig = {
    type: Date,
    default: new Date(new Date().setDate(new Date().getDate() - 1))
}
const boolConfig = {
    type: Boolean,
    required: true
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
    },
    last_reserve: dateConfig,
    last_sell: dateConfig,
    morning_reservation: boolConfig,
    evening_reservation: boolConfig,
    last_airdrop_check: Date,
    last_balance_update: Date,
    balance: Number,
  })

const Accounts = mongoose.models.Accounts ||  mongoose.model('Accounts', AccountsModel)

module.exports = Accounts