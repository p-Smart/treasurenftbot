const Accounts = require("../models/Accounts")
const waitForResponse = require("./waitForResponse")

const checkAirdropAvailable = async (page, token) => {
    await page.evaluate( async (token) => {
        const url = 'https://treasurenft.xyz/gateway/app/treasureBox/record/unOpen/count'

        const {data} = await ( await fetch(url, {
            method: 'POST',
            headers: {
                "Authorization": token,
            },
        }) ).json()

        if(data?.count){
            return true
        }
        return false

    }, token )
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






const grabAirdrops = async (page, token, email, username) => {

    const airdropAvailable = await checkAirdropAvailable(page, token)

    if(!airdropAvailable){
        console.log('No Airdrop On this Account')
        return await Accounts.updateOne({email: email}, {
            last_airdrop_check: new Date()
        })
    }

    while(true){
        await page.goto('https://treasurenft.xyz/#/Airdrop')
        await waitForResponse(page, 'https://treasurenft.xyz/gateway/app/treasureBox/record/all?boxType=RESERVE_BOX')
        await waitForResponse(page, 'https://treasurenft.xyz/gateway/app/treasureBox/record/all?boxType=LEVEL_BOX')
        const disabled = await airdropButtonDisabled(page)
        if(disabled){
            console.log('All Airdrops grabbed')
            await Accounts.updateOne({email: email}, {
                last_airdrop_check: new Date()
            })
            break
        }
        else{
            await Promise.all([
                page.evaluate( () => document.querySelector('button[data-v-a51406d4]').click() ),
                waitForResponse('https://treasurenft.xyz/gateway/app/treasureBox/open')
            ])
            console.log('Grabbed Airdrop for', username || email)
        }

    }
}

module.exports = grabAirdrops