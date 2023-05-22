const login = require('../components/login');
const {isEveningReservationTime, isMorningReservationTime} = require('../components/reservationTimeRange');
const Accounts = require('../models/Accounts')


const ReserveNft = async (_, res) => {
    try{
        if(!isMorningReservationTime() && !isEveningReservationTime()){
            return res.json({
                success: false,
                message: 'Not Reservation Time'
            })
        }
        var account;
        if(isMorningReservationTime()){
            account = await Accounts.findOne({
                reserve_pending: true,
                total_reserved: {$lt: 4},
                morning_reservation: true
            })    
        }
        if(isEveningReservationTime()){
            account = await Accounts.findOne({
                reserve_pending: true,
                total_reserved: {$lt: 4},
                evening_reservation: true
            })
        }

        if(!account){
            return res.json({
                success: false,
                message: 'No Pending Reservations'
            })
        }

        const {email, password} = account
        console.log('Reserve')
        console.log(email)

        var {browser, page} = await login(email, password, res)

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
            $inc: { total_reserved: 1 },
            last_reserve: new Date()
        })

        console.log('Reserve Successful')
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