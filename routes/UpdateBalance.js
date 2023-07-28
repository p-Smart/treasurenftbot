const login = require("../components/login")
const Accounts = require("../models/Accounts")

const UpdateBalance = async (req, res) => {
    try{
        const startOfToday = new Date().setUTCHours(0, 0, 0, 0)
        const endOfToday = new Date().setUTCHours(23, 59, 59, 999)
        const restartDate = new Date('2023-07-25T11:19:45.736+00:00')

        var account

        account = (await Accounts.aggregate([
            { $match: {
                last_balance_update: {
                    $not: {
                    $gte: new Date(startOfToday),
                    $lt: new Date(endOfToday),
                },
                },
                reg_date: {$gt: restartDate},
            } },
            { $sample: { size: 1 } }
        ]))[0]

        if(!account){
            return res.json({
                error: {
                    message: 'Updated all balances for today'
                }
            })
        }

        const {username, email, password} = account
        console.log('Updating balance for ', username || email)

        var {browser, page} = await login(username || email, password, res, {
            width: 800,
            height: 600,
            showMedia: true
        })

        await page.goto('https://treasurenft.xyz/#/uc/userCenter')

        var acctDetails
        await page.waitForResponse(async (response) => {
            try{
                var {message, data} = await response.json()
                acctDetails = data
            }
            catch(err){}
            return (
                (response.url()).includes('https://treasurenft.xyz/gateway/app/user/property') && 
                response.status() === 200 && 
                message === 'SUCCESS'
            )
        } )
        const {balance, income} = acctDetails

        await page.evaluate( () => {
            const closeModal = document.querySelector('.ivu-modal-wrap.announcement-modal a.ivu-modal-close')
            closeModal && closeModal.click()
        } )

        await page.waitForTimeout(1000)
        const screenshot = await page.screenshot({ encoding: 'base64' })
        const base64String = `data:image/png;base64,${screenshot}`

        console.log('Done updating', username || email)

        if(username){
            return await Accounts.updateOne({ username: username }, {
                balance: balance,
                earnings: income,
                image: base64String,
                last_balance_update: new Date()
            })
        }
        if(email){
            return await Accounts.updateOne({email: email}, {
                balance: balance,
                earnings: income,
                image: base64String,
                last_balance_update: new Date()
            })
        }
        
    }
    catch(err){
        try{
            res.status(500).json({
                error: {
                    message: err.message
                }
            })
        }
        catch{
            console.error(err.message)
        }
    }
    finally{
        await page?.close()
        await browser?.close()
    }
}

module.exports = UpdateBalance