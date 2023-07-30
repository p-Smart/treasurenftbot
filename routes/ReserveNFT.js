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

                $expr: {
                    $gte: [{ $subtract: [new Date(), "$last_reserve"] }, twentyHoursInMillis]
                }
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

        var {browser, page} = await connToPuppeteer(800, 600, false)
        
        var {token} = await login(username || email, password, res, page)

        await page.goto('https://treasurenft.xyz/#/store/defi')

        console.log('Gone to Reservation Page')

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
        
        var page2 = await browser.newPage()

        
        await page2.goto('https://treasurenft.xyz/#/uc/userCenter')

        var acctDetails = {}
        try{
            await Promise.race([
                page2.waitForResponse(async (response) => {
                    try{
                        var {message} = await response.json()
                    }
                    catch(err){}
                    return (
                        (response.url()).includes('https://treasurenft.xyz/gateway/app/user/order-count')
                    )
                } ),
                page2.waitForResponse(async (response) => {
                    try{
                        var {message, data} = await response.json()
                        acctDetails = {...data}
                        // (response.url()).includes('https://treasurenft.xyz/gateway/app/user/property') && console.log(data)
                        
                    }
                    catch(err){}
                    return (
                        (response.url()).includes('https://treasurenft.xyz/gateway/app/user/property')
                    )
                } )
            ])
        }catch(err){console.log(err.message)}
        console.log('Passed waiting for screenshot stage')
        var {balance, income} = acctDetails

        if(!balance || !income){
            const balanceResponse = await page2.evaluate( () => {
                const balance =  document.querySelector('h3.title-black-PR-26.text').textContent
                const earnings = document.querySelector('.income-info-area > :nth-child(2) h4.title-black-PR-18').textContent
                return {balance, earnings}
            })
            balance = balanceResponse?.balance
            income = balanceResponse?.earnings
        }

        await page2.evaluate( () => {
            const closeModal = document.querySelector('.ivu-modal-wrap.announcement-modal a.ivu-modal-close')
            closeModal && closeModal.click()
        } )

        await page2.waitForTimeout(1000)
        const screenshot = await page2.screenshot({ encoding: 'base64' })
        const base64String = `data:image/png;base64,${screenshot}`

        console.log('Done updating', username || email)



        return await Accounts.updateOne({
            $or: [{ email: { $eq: email, $ne: '' } }, { username: { $eq: username, $ne: ''  } }]
        }, 
        {
            balance: balance,
            earnings: income,
            ...base64String && {image: base64String},
            last_balance_update: new Date()
        })

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