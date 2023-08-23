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

const airdropButtonDisabled = async (page) => {
    return await page.evaluate( () => {
        const airdropButtonDisabled = document.querySelector('button[data-v-a51406d4]').disabled
        if(airdropButtonDisabled){
            return true
        }
        return false
    } )
}

const waitUntilButtonEnabled = async (page) => {
    return await page.waitForFunction( () => {
        const airdropButtonDisabled = document.querySelector('button[data-v-a51406d4]').disabled
        return !airdropButtonDisabled
    } )
}






const grabAirdrops = async (page, token, email, username) => {

    const airdropAvailable = await checkAirdropAvailable(page, token)

    if(!airdropAvailable){
        return console.log('No Airdrop On this Account')
    }

    while(true){
        await page.goto('https://treasurenft.xyz/#/Airdrop')
        await Promise.race([
            waitUntilButtonEnabled(page),
            Promise.all([
                waitForResponse(page, '/all?boxType=RESERVE_BOX'),
                waitForResponse(page, '/all?boxType=LEVEL_BOX')
            ])
        ])

        const disabled = await airdropButtonDisabled(page)
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
}

module.exports = grabAirdrops