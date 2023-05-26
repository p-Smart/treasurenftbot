const login = require("../components/login")
const Accounts = require("../models/Accounts")


const checkAirdropAvailable = async (page) => {
    return await page.evaluate( () => {
        const airdropAvailable = document.querySelector('.ivu-badge .ivu-badge-count')
        if(airdropAvailable){
            return true
        }
        return false
    } )    
}

const airdropButtonDisabled = async (page) => {
    return await page.evaluate( () => {
        const airdropButtonDisabled = document.querySelector('button[data-v-a51406d4]').disabled
        if(airdropButtonDisabled){
            return true
        }
        return false
    } )
}


const GetAirdrops = async (_, res) => {
    try{
        const startOfToday = new Date().setUTCHours(0, 0, 0, 0)
        const endOfToday = new Date().setUTCHours(23, 59, 59, 999)

        const account = await Accounts.findOne({
            last_airdrop_check: {
                $not: {
                $gte: new Date(startOfToday),
                $lt: new Date(endOfToday)
                }
            }
        })

        if(!account){
            return res.json({
                error: {
                    message: 'No account to grab Airdrop for today'
                }
            })
        }

        const {email, password} = account
        console.log('Getting Airdrop for ', email)

        var {browser, page} = await login(email, password, res)

        await page.waitForTimeout(2000)
        const airdropAvailable = await checkAirdropAvailable(page)

        if(!airdropAvailable){
            console.log('No Airdrop On this Account')
            return await Accounts.updateOne({email: email}, {
                last_airdrop_check: new Date()
            })
        }

        while(true){
            await page.goto('https://treasurenft.xyz/#/Airdrop')
            await page.waitForTimeout(2000)
            disabled = await airdropButtonDisabled(page)
            if(disabled){
                console.log('All Airdrops grabbed')
                await Accounts.updateOne({email: email}, {
                    last_airdrop_check: new Date()
                })
                break
            }
            else{
                await page.click('button[data-v-a51406d4]')
                await page.waitForSelector('.ReserveCratesOpenChest-row.ivu-row')
                    console.log('Grabbed Airdrop')
            }

        }
        return console.log('Done here')
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

module.exports = GetAirdrops