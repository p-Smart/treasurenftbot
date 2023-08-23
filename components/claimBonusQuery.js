const Accounts = require("../models/Accounts");

const twenty4HoursInMillis = 24 * 60 * 60 * 1000;

const claimBonusQuery = async (all) => {

    const restartDate = new Date('2023-07-25T11:19:45.736+00:00')
    const query = {
        owner: 'prince',
        working: { $ne: true },
        reg_date: { $gt: restartDate },
        incorrect_details: {$ne: true},
        deposited_in: true,

        $expr: {
            $gte: [{ $subtract: [new Date(), "$last_update"] }, twenty4HoursInMillis]
        }
    }

        if(all){
            return await Accounts.find(query)
        }
        const account = (await Accounts.aggregate([
            {
                $match: query
            },
            { $sample: { size: 1 } }
        ]))[0]

    return account
}

module.exports = claimBonusQuery