const updateAccount = require('../components/UpdateAccount');
const {setWorkingFalse, setWorkingTrue, setAllWorkingFalse} = require('../components/Working');
const blockMediaRequests = require('../components/blockMediaRequest');
const login = require('../components/login');
const reserveNFT = require('../components/reserveNFT');
const reserveNFTQuery = require('../components/reserveNFTQuery');
const setPageSettings = require('../components/setPageSettings');
const connToPuppeteer = require('../config/pupConnect');
const Accounts = require('../models/Accounts')
const { isEveningReservationTime, isMorningReservationTime } = require("../components/reservationTimeRange");


const ReserveNft = async (_, res) => {
    var accountsDone = 0
    try{
        if(!isMorningReservationTime() && !isEveningReservationTime()){
            return res.json({
                success: false,
                message: 'Not Reservation Time'
            })
        }
        var account = await reserveNFTQuery()

        if(!account){
            return res.json({
                success: false,
                message: 'No Pending Reservations'
            })
        }

        var {username, email, UID, password} = account
        console.log('Reserve')
        console.log(username || email)

        var {browser, context, page} = await connToPuppeteer()
        
        const handleReserveNFT = async () => {
            await setWorkingTrue(Accounts, username, email)
            if(accountsDone !== 0){
                account = await reserveNFTQuery()
                if(!account){
                    return console.log('No Pending Reservations')
                }
                
                username = account.username
                email = account.email
                password = account.password
                console.log('Reserve')
                console.log(username || email)

                context = await browser.createIncognitoBrowserContext()
                page = await context.newPage()
                await setPageSettings(page)
            }

            var {token} = await login(username || email, password, res, page)

            await page.waitForFunction(() => !document.querySelector('.loginModal'))
            console.log('Gotten to homepage')

            await reserveNFT(page, token, account)

            await setWorkingFalse(Accounts, username, email)

            if(!(process.env.LEAVE_BROWSER_OPENED)){
                await page?.close()
                await context?.close()
            }

            if(accountsDone < 10){
                ++accountsDone
                return await handleReserveNFT()
            }
            return
        }

        await handleReserveNFT()

        
        // Update Account details
        // var page2
        // page2 = await updateAccount(browser, email, username, UID, token)

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
        if(!(process.env.LEAVE_BROWSER_OPENED)){
            try{
                // await page2?.close()
                // await page?.close()
                await browser?.close()
            }
            catch(err){ console.error(err.message) }
        }
        await setAllWorkingFalse(Accounts)
    }
}


module.exports = ReserveNft