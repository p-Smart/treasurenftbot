const updateAccount = require('../components/UpdateAccount');
const {setWorkingFalse, setWorkingTrue} = require('../components/Working');
const blockMediaRequests = require('../components/blockMediaRequest');
const login = require('../components/login');
const {isEveningReservationTime, isMorningReservationTime} = require('../components/reservationTimeRange');
const connToPuppeteer = require('../config/pupConnect');
const Accounts = require('../models/Accounts')


const ReserveNft = async (_, res) => {
    const twentyHoursInMillis = 20 * 60 * 60 * 1000;
    try{
        if(!isMorningReservationTime() && !isEveningReservationTime()){
            return res.json({
                success: false,
                message: 'Not Reservation Time'
            })
        }
        var account;
        const restartDate = new Date('2023-07-25T11:19:45.736+00:00')

        account = (await Accounts.aggregate([
            { $match: {
                reserve_pending: true,
                total_reserved: {$lt: 2},
                working: false,
                reg_date: {$gt: restartDate},
                incorrect_details: false,
                account_done: {$ne: true},

                $expr: {
                    $gte: [{ $subtract: [new Date(), "$last_reserve"] }, twentyHoursInMillis]
                },
            } },
            { $sample: { size: 1 } }
        ]))[0]
        // For testing
        // account = await Accounts.findOne({})

        if(!account){
            return res.json({
                success: false,
                message: 'No Pending Reservations'
            })
        }

        var {username, email, password} = account
        console.log('Reserve')
        console.log(username || email)

        await setWorkingTrue(Accounts, username, email)

        var {browser, page} = await connToPuppeteer()
        
        var {token} = await login(username || email, password, res, page)

        await page.goto('https://treasurenft.xyz/#/store/defi')

        console.log('Gone to Reservation Page')

        var reserveBalance
        await page.waitForResponse(async (response) => {
            try{
                var {message, data} = await response.json()
                if((response.url()).includes('https://treasurenft.xyz/gateway/app/reserve/deposit')){
                    const rsvBal = data?.reserveBalance
                    reserveBalance = rsvBal

                }
            }
            catch(err){}
            return (
                (response.url()).includes('https://treasurenft.xyz/gateway/app/reserve/deposit') &&
                response.status() === 200
            )
        } )

        if(reserveBalance && (parseFloat(reserveBalance) < 50)){
            console.log('No more reservations on this account')
            return await Accounts.updateOne({$or: [{ email: { $eq: email, $ne: '' } }, { username: { $eq: username, $ne: ''  } }]}, {
                account_done: true
            })
        }

        await page.waitForSelector((`button.ivu-btn.ivu-btn-success.ivu-btn-long`))

        await page.evaluate( () => {
            const closeModal = document.querySelector('.ivu-modal-wrap.announcement-modal a.ivu-modal-close')
            closeModal && closeModal.click()
        } )

        await page.waitForFunction( () => !(document.querySelector(`button.ivu-btn.ivu-btn-success.ivu-btn-long`).disabled) )

        await page.evaluate( () => {
            const reserveButton = document.querySelector(`button.ivu-btn.ivu-btn-success.ivu-btn-long`)
            reserveButton.click()
        } )

        await page.waitForFunction(() => {
            return parseFloat(document.querySelector('.reserve-number').innerText) !== 0
        })

        await page.evaluate( () => {
            const confirmReserveButton = document.querySelector('.reserve-wrap button')
            confirmReserveButton.click()
        } )

        await page.waitForResponse(async (response) => {
            try{
                var {message} = await response.json()
            }
            catch(err){}
            return (
                (response.url()).includes('https://treasurenft.xyz/gateway/app/reserve/insert') && 
                response.status() === 200 && 
                message === 'SUCCESS'
            )
        } )

        console.log('Success')

        await Accounts.updateOne({$or: [{ email: { $eq: email, $ne: '' } }, { username: { $eq: username, $ne: ''  } }]}, {
            reserve_pending: false,
            sell_pending: true,
            $inc: { total_reserved: 1 },
            last_reserve: new Date()
        })

        console.log('Reserve Successful')
        // Update Account details
        
        var page2 = await updateAccount(browser, email, username)

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
        if(!(process.env.DEV)){
            await page2?.close()
            await page?.close()
            await browser?.close()
        }
        await setWorkingFalse(Accounts, username, email)
    }
}


module.exports = ReserveNft