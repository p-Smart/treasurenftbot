const Accounts = require("../models/Accounts");
const isTimeToSell = require("./sellTimeRange");



const sellNFTQuery = async () => {
    // if(!isTimeToSell()){
    //     return res.json({
    //         success: false,
    //         message: 'Not Sell Time'
    //     })
    // }


    const restartDate = new Date('2023-07-25T11:19:45.736+00:00')
    const fiveHours30MinsInMillis = ((5 * 60) + 30) * 60 * 1000;

    const account =  (await Accounts.aggregate([
        { $match: {
            owner: 'prince',
            sell_pending: true,
            // total_sell: {$lt: 2},
            // last_sell: { $gte: getStartOfYesterDay(), $lt: getEndOfYesterday() },
            working: {$ne: true},
            reg_date: {$gt: restartDate},
            incorrect_details: {$ne: true},
            account_done: {$ne: true},
            deposited_in: true,

            ...!isTimeToSell() && {
                $expr: {
                    $gte: [{ $subtract: [new Date(), "$last_reserve"] }, fiveHours30MinsInMillis]
                }
            }
        } },
        { $sample: { size: 1 } }
    ]))[0]

    return account
}

module.exports = sellNFTQuery