const Accounts = require('../models/Accounts')
const isTimeToSell = require('../components/sellTimeRange')
const { getStartOfYesterDay, getEndOfYesterday } = require('../components/dates')
const login = require('../components/login')

const SellNFT = async (req, res) => {
    try{
        if(!isTimeToSell()){
            return res.json({
                success: false,
                message: 'Not Sell Time'
            })
        }

        const account = await Accounts.findOne({
            sell_pending: true,
            total_sell: {$lt: 4},
            last_sell: { $gte: getStartOfYesterDay(), $lt: getEndOfYesterday() }
        })

        if(!account){
            return res.json({
                success: false,
                message: 'No Pending Sell'
            })
        }

        const {email, password} = account
        console.log('Sell')
        console.log(email)

        var {browser, page} = await login(email, password, res)

        await page.goto('https://treasurenft.xyz/#/collection')

        await page.waitForTimeout(2000)
        await page.click('.ivu-tabs-tab:nth-child(3)')
        console.log('Gone to Sell Page')

        await page.waitForSelector('.pro-list-wrap .ivu-col')

        console.log('Sell Page Loaded')
        

        await page.click('button.block-btn.ivu-btn.ivu-btn-primary.ivu-btn-long')

        console.log('Sell Button Clicked')

        await page.waitForTimeout(2000)

        console.log('Sell Confirmation page opened')

        await page.click('.footer button.ivu-btn.ivu-btn-primary.ivu-btn-long')

        console.log('Sell Button Clicked')

        await page.waitForTimeout(2000)
        console.log('Sell Confirmed')


        await Accounts.updateOne({ email: email }, {
            reserve_pending: true,
            sell_pending: false,
            $inc: { total_sell: 1 },
            last_sell: new Date()
        })

        console.log('Sell Successful')

        // res.json({
        //     success: true,
        // })
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


module.exports = SellNFT