const pup = require('puppeteer-core')
const isReservationTime = require('../components/reservationTimeRange')
const Accounts = require('../models/Accounts')
const {BROWSERLESS_KEY} = process.env


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
        console.log('Reserve')
        console.log(email)

        // var browser = await pup.launch({
        //     headless: 'new',
        //     executablePath: `C:/Users/Prince/.cache/puppeteer/chrome/win64-113.0.5672.63/chrome-win64/chrome.exe`,
        //     defaultViewport: { width: 1500, height: 736 }
        // })

        var browser = await pup.connect({
            browserWSEndpoint: `wss://chrome.browserless.io?token=${BROWSERLESS_KEY}`,
            defaultViewport: { width: 1500, height: 736 },
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        }, {timeout: 0})

        var page = await browser.newPage()
        await page.setDefaultTimeout(30000)
        await page.setRequestInterception(true);

        res.json({
            success: true,
            message: 'Passed Reserve Job on to Puppeteer...'
        })

        await page.on('request', (request) => {
        // Enable interception for the request
        request.continue();
        });


        await page.goto('https://treasurenft.xyz/')
        console.log('Gone to website')

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
            await inputs[i].type(email, {delay: 50});
        } else if (i === 1) {
            await inputs[i].type(password, {delay: 50});
        }
        }
        console.log('Typed Details')

        // Click on Login
        await page.evaluate( () => {
            let loginButton = document.querySelector(`button.ivu-btn.ivu-btn-primary.ivu-btn-long`)
            loginButton.click()
        } )

        await page.waitForFunction(() => !document.querySelector('.loginModal'))
        console.log('Logged In Successfully')

        await page.goto('https://treasurenft.xyz/#/store/defi')

        console.log('Gone to Reservation Page')

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
        } )

        await page.waitForTimeout(2000)

        await Accounts.updateOne({ email: email }, {
            reserve_pending: false,
            sell_pending: true,
            $inc: { total_reserved: 1 }
        })

        console.log('Reserve Successful')

        // res.json({
        //     success: true,
        //     message: 'Reserved!, waiting to sell'
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


module.exports = ReserveNft