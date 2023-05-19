const pup = require('puppeteer-core')
const isReservationTime = require('../components/reservationTimeRange')
const Accounts = require('../models/Accounts')


const ReserveNft = async (req, res) => {
    try{
        if(!isReservationTime()){
            return res.json({
                success: false,
                message: 'Not Reservation Time'
            })
        }

        const account = await Accounts.findOne({
            reserve_pending: true,
            total_reserved: {$lt: 4},
        })

        if(!account){
            return res.json({
                success: false,
                message: 'No Pending Reservations'
            })
        }

        const {email, password} = account
        console.log(email)

        var browser = await pup.launch({
            headless: 'new',
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

        // Type in Userbame and Password Input Field

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

        await page.goto('https://treasurenft.xyz/#/store/defi')

        await page.waitForSelector((`button.ivu-btn.ivu-btn-success.ivu-btn-long`))

        await page.evaluate( () => {
            const reserveButton = document.querySelector(`button.ivu-btn.ivu-btn-success.ivu-btn-long`)
            setTimeout( () => reserveButton.click(), 2500 )
        } )

        await page.waitForFunction(() => {
            return parseFloat(document.querySelector('.reserve-number').innerText) !== 0
        })

        await page.evaluate( () => {
            const confirmReserveButton = document.querySelector('.reserve-wrap button')
            confirmReserveButton.click()
            setTimeout( () => console.log('Done'), 1000 )
        } )

        await Accounts.updateOne({ email: email }, {
            reserve_pending: false,
            sell_pending: true,
            $inc: { total_reserved: 1 }
        })

        res.json({
            success: true,
            message: 'Reserved!, waiting to sell'
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


module.exports = ReserveNft