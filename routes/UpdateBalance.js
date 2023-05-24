const login = require("../components/login")
const Accounts = require("../models/Accounts")


const getBalance = async (page) => {
    return await page.evaluate( () => parseFloat(document.querySelector('.USDTIcon h3.title-black-PR-26.text').textContent) )
}
const getEarnings = async (page) => {
    return await page.evaluate( () => parseFloat(document.querySelector('.income-info-area > :nth-child(2) h4').textContent) )
}

const UpdateBalance = async (_, res) => {
    try{
        const startOfToday = new Date().setUTCHours(0, 0, 0, 0)
        const endOfToday = new Date().setUTCHours(23, 59, 59, 999)

        const account = await Accounts.findOne({
            morning_reservation: true,
            last_balance_update: {
                $not: {
                $gte: new Date(startOfToday),
                $lt: new Date(endOfToday)
                }
            }
        })

        if(!account){
            return res.json({
                error: {
                    message: 'Updated all balances for today'
                }
            })
        }

        const {email, password} = account
        console.log('Updating balance for ', email)

        var {browser, page} = await login(email, password, res)

        await page.goto('https://treasurenft.xyz/#/uc/userCenter')
        console.log('Gone to balance page')


        await page.waitForSelector('.USDTIcon h3.title-black-PR-26.text')
        await page.waitForSelector('.income-info-area > :nth-child(2) h4')

        
        await page.waitForTimeout(3000)

        const balance = await getBalance(page)
        const earnings = await getEarnings(page)
        
        console.log(balance)
        console.log(earnings)

        await Accounts.updateOne({email: email}, {
            balance: balance,
            earnings: earnings,
            last_balance_update: new Date()
        })
        console.log('Balance updated')
        
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