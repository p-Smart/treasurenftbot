const Accounts = require("../models/Accounts")


const getUplineId = async (userUID) => {

    const level0Accounts = await Accounts.find({level0: true})

    const accountWithMatchingReferral = level0Accounts.find( ({referrals}) => (
        Array.from( referrals ).some((referral) => referral?.UID === userUID)
        ) )
    return {
        uplineUID: accountWithMatchingReferral?.UID || '',
        uplineUsername: accountWithMatchingReferral?.username || accountWithMatchingReferral?.email || '',
    } 
}


module.exports = getUplineId