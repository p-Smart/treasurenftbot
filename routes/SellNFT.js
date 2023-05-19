const pup = require('puppeteer-core')
const Accounts = require('../models/Accounts')
const isTimeToSell = require('../components/sellTimeRange')


const SellNFT = async (req, res) => {
    try{
        if(isTimeToSell()){
            return res.json({
                success: false,
                message: 'Not Sell Time'
            })
        }

        const account = await Accounts.findOne({
            sell_pending: true,
            total_sell: {$lt: 4},
        })

        if(!account){
            return res.json({
                success: false,
                message: 'No Pending Sell'
            })
        }

        const {email, password} = account

        var browser = await pup.launch({
            headless: false,
            executablePath: `C:/Users/Prince/.cache/puppeteer/chrome/win64-113.0.5672.63/chrome-win64/chrome.exe`,
            defaultViewport: { width: 1500, height: 736 }
        })
        var page = await browser.newPage()
        await page.setDefaultTimeout(0)
        await page.setRequestInterception(true);

        await page.on('request', (request) => {
        // Enable interception for the request
        request.continue();
        });


        await page.goto('https://treasurenft.xyz/')

        // Click on Account Menu (to Login)
        await page.evaluate( () => {
            let menu = document.querySelectorAll('.menu-wrap-item')
            let loginMenu = Array.from(menu)[1]
            loginMenu.click()
            return
        } )

        await page.waitForSelector('.ivu-input.ivu-input-default')

        // Type in Username and Password Input Field

        const inputs = await page.$$('.ivu-input.ivu-input-default');
        for (let i = 0; i < inputs.length; i++) {
        if (i === 0) {
            await inputs[i].type(email, {delay: 200});
        } else if (i === 1) {
            await inputs[i].type(password, {delay: 200});
        }
        }

        // Click on Login
        await page.evaluate( () => {
            let loginButton = document.querySelector(`button.ivu-btn.ivu-btn-primary.ivu-btn-long`)
            loginButton.click()
        } )

        await page.waitForFunction(() => !document.querySelector('.loginModal'))

        await page.goto('https://treasurenft.xyz/#/collection')

        await page.evaluate( () => {
            const collectionTab = Array.from(document.querySelectorAll('.ivu-tabs-tab'))[1]
            collectionTab.click()
        } )



        await Accounts.updateOne({ email: email }, {
            reserve_pending: true,
            sell_pending: false,
            $inc: { total_sell: 1 }
        })

        res.json({
            success: true
        })
    }
    catch(err){
        res.status(500).json({
            error: {
                message: err.message
            }
        })
    }
    finally{
        await page?.close()
        await browser?.close()
    }
}


module.exports = SellNFT