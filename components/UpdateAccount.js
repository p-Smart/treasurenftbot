const Accounts = require("../models/Accounts")



const updateAccount = async (browser, email, username) => {

    var page2 = await browser.newPage()
    await page2.setViewport({
        width: 800,
        height: 600,
        deviceScaleFactor: 1,
      })

        
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



        await Accounts.updateOne({
            $or: [{ email: { $eq: email, $ne: '' } }, { username: { $eq: username, $ne: ''  } }]
        }, 
        {
            balance: balance,
            earnings: income,
            ...base64String && {image: base64String},
        })
        return page2
}

module.exports = updateAccount