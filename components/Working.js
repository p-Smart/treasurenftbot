


const setWorkingFalse = async (Accounts, username, email) => {
    try{
        return await Accounts.updateOne({
            $or: [{ email: { $eq: email, $ne: '' } }, { username: { $eq: username, $ne: ''  } }]
        }, 
        {working: false})
    }
    catch(err){
        await setWorkingFalse(Accounts)
    }
}


const setWorkingTrue =  async (Accounts, username, email) => {
    try{
        return await Accounts.updateOne({
            $or: [{ email: { $eq: email, $ne: '' } }, { username: { $eq: username, $ne: ''  } }]
        }, 
        {working: true})
    }
    catch(err){
        await setWorkingTrue(Accounts)
    }
}

module.exports = {
    setWorkingFalse,
    setWorkingTrue
}