const {setWorkingFalse, setWorkingTrue, setAllWorkingFalse} = require('../components/Working');
const login = require('../components/login');
const setPageSettings = require('../components/setPageSettings');
const connToPuppeteer = require('../config/pupConnect');
const Accounts = require('../models/Accounts')
const claimBonusQuery = require('../components/claimBonusQuery');
const grabAirdrops = require('../components/grabAirdrops');
const getPoints = require('../components/GetPoints');
const sendTGMessage = require('../components/sendTGMessage');
const genRandomDevice = require('../components/generateRandomDevice');
const fetchIp = require('../components/fetchIp');


const ClaimBonus = async (_, res) => {
    var accountsDone = 0
    try{
        var account = await claimBonusQuery()

        if(!account){
            return res.json({
                success: false,
                message: 'Bonus Claimed on all accounts'
            })
        }

        var {username, email, UID, password} = account
        // var {username, email, UID, password} = {username: 'israeltolami', password: 'IsraelTola1234'}
        console.log('Claiming Bonus for', username || email)

        var {browser, context, page} = await connToPuppeteer()
        
        const handleClaimBonus = async () => {
            await setWorkingTrue(Accounts, username, email)
            if(accountsDone !== 0){
                account = await claimBonusQuery()
                if(!account){
                    return console.log('Bonus Claimed on all accounts')
                }
                
                username = account.username
                email = account.email
                password = account.password
                
                await setWorkingTrue(Accounts, username, email)
                console.log('Claiming Bonus for', username || email)

                context = await browser.createIncognitoBrowserContext()
                page = await context.newPage()
                await setPageSettings(page)
                await page.emulate(genRandomDevice())
            }

            var {token} = await login(username || email, password, res, page)

            await page.waitForFunction(() => !document.querySelector('.loginModal'))
            console.log('Gotten to homepage')

            const airdropsGrabbed =  await grabAirdrops(page, token, email, username)
            const ipAddress =  await fetchIp(page)
            await sendTGMessage(`Grabbed (${airdropsGrabbed}) Airdrops for ${username || email}\nIP: ${ipAddress}`)

            // await getPoints(page, token)
            // await sendTGMessage(`Grabbed Points for ${username || email}`)

            await Accounts.updateOne({$or: [{ email: { $eq: email, $ne: '' } }, { username: { $eq: username, $ne: ''  } }]}, {
                last_update: new Date()
            })

            await setWorkingFalse(Accounts, username, email)

            if(!(process.env.LEAVE_BROWSER_OPENED)){
                await page?.close()
                await context?.close()
            }

            // if(accountsDone < 10){
            //     ++accountsDone
            //     return await handleClaimBonus()
            // }
            return
        }

        await handleClaimBonus()

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
                await browser?.close()
            }
            catch(err){ console.error(err.message) }
        }
        await setAllWorkingFalse(Accounts)
    }
}


module.exports = ClaimBonus