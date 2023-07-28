


const setWorkingFalse = async (Accounts, username, email) => {
    try{
        if(email){
            return await Accounts.updateOne({email: email}, {working: false})
        }
        if(username){
            return await Accounts.updateOne({username: username}, {working: false})
        }
    }
    catch(err){
        await setWorkingFalse(Accounts)
    }
}


const setWorkingTrue =  async (Accounts, username, email) => {
    try{
        if(email){
            return await Accounts.updateOne({email: email}, {working: true})
        }
        if(username){
            return await Accounts.updateOne({username: username}, {working: true})
        }
    }
    catch(err){
        await setWorkingTrue(Accounts)
    }
}

module.exports = {
    setWorkingFalse,
    setWorkingTrue
}