const Accounts = require("../models/Accounts")
const waitForResponse = require("./waitForResponse")


const checkAirdropAvailable = async (page, token) => {
    return await page.evaluate( async (token) => {
        const url = 'https://treasurenft.xyz/gateway/app/treasureBox/record/unOpen/count'

        const {data} = await ( await fetch(url, {
            method: 'GET',
            headers: {
                "Authorization": token,
            },
        }) ).json()

        if(data?.count != 0){
            return true
        }
        return false

    }, token )
}

const airdropButtonDisabled = async (page, buttonType='reservation') => {
    const selector = buttonType==='reservation' ? `button[data-v-a51406d4]` : `button[data-v-debb4840]`
    
    return await page.evaluate( (selector) => {
        const airdropButtonDisabled = document.querySelector(selector).disabled
        if(airdropButtonDisabled){
            return true
        }
        return false
    }, selector )
}

const waitUntilButtonEnabled = async (page, buttonType='reservation') => {
    const selector = buttonType==='reservation' ? `button[data-v-a51406d4]` : `button[data-v-debb4840]`

    return await page.waitForFunction( (selector) => {
        const airdropButtonDisabled = document.querySelector(selector).disabled
        return !airdropButtonDisabled
    }, selector )
}


const getLevelBoxUnOpened = async (page, token) => {
    return await page.evaluate( async (token) => {
        const extractLevelNumber = (str) => parseInt(str.match(/LEVEL_BOX_(\d+)/)[1])

        const url = 'https://treasurenft.xyz/gateway/app/treasureBox/record/all?boxType=LEVEL_BOX'

        const {data} = await ( await fetch(url, {
            method: 'GET',
            headers: {
                "Authorization": token,
            },
        }) ).json()

        if(data?.total == 0){
            return false
        }
        const availableUnOpenedBoxes = data?.pageList?.filter( ({status}) => status !== 'OPENED' )
        if(availableUnOpenedBoxes.length === 0){
            return false
        }
        
        return (availableUnOpenedBoxes.map( ({boxType}) => extractLevelNumber(boxType)))[0]
    }, token )
}






const grabAirdrops = async (page, token, email, username) => {
    var airdropAvailable

    airdropAvailable = await checkAirdropAvailable(page, token)

    if(!airdropAvailable){
        return console.log('No Airdrop On this Account')
    }

    while(true){
        await page.goto('https://treasurenft.xyz/#/Airdrop')
        
        await Promise.race([
            waitUntilButtonEnabled(page, 'reservation'),
            waitForResponse(page, '/app/treasureBox/record/all')
        ])
        

        const disabled = await airdropButtonDisabled(page, 'reservation')
        if(disabled){
            console.log('All Airdrops grabbed')
            break
        }
        else{
            await Promise.all([
                page.evaluate( () => document.querySelector('button[data-v-a51406d4]').click() ),
                waitForResponse(page, 'https://treasurenft.xyz/gateway/app/treasureBox/open')
            ])
            console.log('Grabbed Airdrop for', username || email)
        }

    }

    airdropAvailable = await checkAirdropAvailable(page, token)

    if(airdropAvailable){
        while(true){
            const levelBoxUnopened = await getLevelBoxUnOpened(page, token)
            if(!levelBoxUnopened){
                break
            }

            await page.evaluate( () => {
                const levelBoxTab = document.querySelectorAll('.ivu-tabs-nav .ivu-tabs-tab')[1]
                levelBoxTab.click()
            } )
    
            await page.evaluate( (level) => {
                const levelMenu = document.querySelectorAll('.ivu-col.ivu-col-span-4 .navMenu-div')[level-1]
                levelMenu.click()
            }, levelBoxUnopened )
    
            await Promise.race([
                waitUntilButtonEnabled(page, 'levelUpReward'),
                waitForResponse(page, `https://treasurenft.xyz/gateway/app/treasureBox/setting?boxType=LEVEL_BOX_${levelBoxUnopened}`)
            ])

            const disabled = await airdropButtonDisabled(page, 'levelUpReward')
            if(disabled){
                console.log('All level up rewards grabbed')
                break
            }
            else{
                await Promise.all([
                    page.evaluate( () => document.querySelector('button[data-v-debb4840]').click() ),
                    waitForResponse(page, 'https://treasurenft.xyz/gateway/app/treasureBox/open')
                ])
                console.log('Level Up Airdrop Grabbed for', username || email)
            }

            await page.goto('https://treasurenft.xyz/#/Airdrop')
        }
    }
}

module.exports = grabAirdrops