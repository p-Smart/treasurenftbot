const Accounts = require('../models/Accounts')
const isTimeToSell = require('../components/sellTimeRange')
const { getStartOfYesterDay, getEndOfYesterday } = require('../components/dates')
const login = require('../components/login')
const { setWorkingFalse, setWorkingTrue, setAllWorkingFalse } = require('../components/Working')
const connToPuppeteer = require('../config/pupConnect')
const updateAccount = require('../components/UpdateAccount')
const sellNFT = require('../components/sellNFT')
const setPageSettings = require('../components/setPageSettings')
const sellNFTQuery = require('../components/sellNFTQuery')

const SellNFT = async (req, res) => {
    var accountsDone = 0
    try{
        var account = await sellNFTQuery()
        
        if(!account){
            return res.json({
                success: false,
                message: 'No Pending Sell'
            })
        }

        var {username, email, password, UID, last_reserve, reg_date} = account
        console.log('Sell')
        console.log(email || username)


        var {browser, context, page} = await connToPuppeteer()
        
        const handleSellNFT = async () => {
            await setWorkingTrue(Accounts, username, email)
            if(accountsDone !== 0){
                account = await sellNFTQuery()
                if(!account){
                    return console.log('No more pending Sells')
                }
                
                username = account.username
                email = account.email
                password = account.password
                console.log('Sell')
                console.log(email || username)

                context = await browser.createIncognitoBrowserContext()
                page = await context.newPage()
                await setPageSettings(page)
            }
            var {token} = await login(username || email, password, res, page)

            await page.waitForFunction(() => !document.querySelector('.loginModal'))

            await sellNFT(page, token, account)

            await setWorkingFalse(Accounts, username, email)

            if(!(process.env.LEAVE_BROWSER_OPENED)){
                await page?.close()
                await context?.close()
            }

            if(accountsDone < 1){
                ++accountsDone
                return await handleSellNFT()
            }
            return
        }

        await handleSellNFT()
        

        var page2
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


module.exports = SellNFT