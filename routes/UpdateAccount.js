const updateAccount = require("../components/UpdateAccount")
const { setWorkingFalse, setWorkingTrue } = require("../components/Working")
const login = require("../components/login")
const connToPuppeteer = require("../config/pupConnect")
const Accounts = require("../models/Accounts")

const UpdateBalance = async (req, res) => {
    const level0 = req.query.level0
    try{
        const startOfToday = new Date().setUTCHours(0, 0, 0, 0)
        const endOfToday = new Date().setUTCHours(23, 59, 59, 999)
        const restartDate = new Date('2023-07-25T11:19:45.736+00:00')

        const twenty4HoursInMilliscs = 24 * 60 * 60 * 1000;

        var account

        account = (await Accounts.aggregate([
            { $match: {
                $or: [
                    {total_sell: {$gte: 2}},
                    {account_done: true}
                ],
                last_balance_update: {
                    $not: {
                    $gte: new Date(startOfToday),
                    $lt: new Date(endOfToday),
                },
                },
                reg_date: {$gt: restartDate},
                incorrect_details: false,
                $expr: {
                    $gte: [{ $subtract: [new Date(), "$last_sell"] }, twenty4HoursInMilliscs]
                },


                ...level0 &&  {level0: true},
                owner: 'prince',
                // email: 'psmart2002@gmail.com'
            } },
            { $sample: { size: 1 } }
        ]))[0]
        // const {image, ...rest} = account
        // return res.json(rest)

        if(!account){
            return res.json({
                error: {
                    message: 'Updated all accounts for today'
                }
            })
        }

        var {username, email, UID, password} = account
        // var {username, email, UID, password} = await Accounts.findOne({email: 'michaelolamide1998@macr2.com'})
        console.log('Updating account for ', username || email)

        await setWorkingTrue(Accounts, username, email)

        var {browser, page} = await connToPuppeteer()

        var {token} = await login(username || email, password, res, page)

        var page2 = await updateAccount(browser, email, username, UID, token, true)
        
    }
    catch(err){
        console.error(err.message)
    }
    finally{
        if(!(process.env.DEV)){
            await page2?.close()
            await page?.close()
            await browser?.close()
        }
        await setWorkingFalse(Accounts, username, email)
    }
}

module.exports = UpdateBalance