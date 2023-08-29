const Accounts = require("../models/Accounts");

const twentyHoursInMillis = 20 * 60 * 60 * 1000;

const reserveNFTQuery = async (all) => {

    const restartDate = new Date('2023-07-25T11:19:45.736+00:00')
    const query = {
        owner: 'prince',
        reserve_pending: true,
        // total_reserved: { $lt: 2 },
        working: { $ne: true },
        reg_date: { $gt: restartDate },
        incorrect_details: false,
        account_done: { $ne: true },
        deposited_in: true,
        $expr: { $lt: ["$total_reserved", "$maxReserves"] },
        $or: [
            { reservationBalance: { $gte: 18 } },
            {
                $expr: {
                    $and: [
                        { $gte: [{ $subtract: [new Date(), "$last_reserve"] }, twentyHoursInMillis] },
                        { $lt: ["$reservationBalance", 18 ] }
                    ]
                }
            }
        ]
    }

        if(all){
            return await Accounts.find(query)
        }
        // const account = (await Accounts.aggregate([
        //     {
        //         $match: query
        //     },
        //     { $sample: { size: 1 } }
        // ]))[0]

        const account = await Accounts.findOne(query).sort({ reg_date: -1 })

    return account
}

module.exports = reserveNFTQuery