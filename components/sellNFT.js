const Accounts = require("../models/Accounts")
const fetchIp = require("./fetchIp")
const getAvailNFT = require("./getAvailNFTToSell")
const getReservationBal = require("./getReservationBal")
const sendTGMessage = require("./sendTGMessage")
const waitForResponse = require("./waitForResponse")




const sellNFT = async (page, token, details) => {
    var {username, email, reg_date, _id} = details
    const ipAddress =  await fetchIp(page)

    await Promise.all([
        page.goto('https://treasurenft.xyz/#/collection', {timeout: 0}),
        waitForResponse(page, '/app/order/message-list')
    ])

    const reserveBalance = await getReservationBal(page, token)

    
    console.log('Reserves Tab loaded')
    
    await page.waitForSelector(`.ivu-tabs-nav :nth-child(3)`)
    await page.evaluate( () => document.querySelector(`.ivu-tabs-nav :nth-child(3)`).click() )
    console.log('Clicked Collected Tab')

    var nftAvailableToSell = true
    await page.waitForResponse(async (response) => {
        try{
            var {message, data} = await response.json()
            if(data.total === 0 && data.totalPages === 0){
                nftAvailableToSell = false
            }
        }
        catch(err){}
        return (
            (response.url()).includes('/app/NFTItem/mine') && 
            response.status() === 200 && 
            message === 'SUCCESS'
        )
    } )
    console.log('Collected Tab loaded')

    nftAvailableToSell = await getAvailNFT(page, token)

    if(!nftAvailableToSell){
        await Accounts.updateOne({$or: [{ email: { $eq: email, $ne: '' } }, { username: { $eq: username, $ne: ''  } }]}, {
            sell_pending: false,
            reserve_pending: true,
            reservationBalance: reserveBalance
        })
        await sendTGMessage(`No NFT to sell for ${username || email}.\nIP: ${ipAddress}`)
        return console.log('No NFT to sell')
    }


    var sellsDone = 1

    while (sellsDone <= nftAvailableToSell){
        await page.waitForSelector('button.block-btn.ivu-btn.ivu-btn-primary.ivu-btn-long')
        await page.evaluate( () => document.querySelector('button.block-btn.ivu-btn.ivu-btn-primary.ivu-btn-long').click() )

        console.log('Sell Button Clicked')

        // Wait for confirm sell sidebar to load
        await page.waitForResponse(async (response) => {
            try{
                var {message} = await response.json()
            }
            catch(err){}
            return (
                (response.url()).includes('https://treasurenft.xyz/gateway/app/level/fee') &&
                response.status() === 200 && 
                message === 'SUCCESS'
            )
        } )

        console.log('Sell Confirmation page opened')

        await page.waitForSelector('.footer button.ivu-btn.ivu-btn-primary.ivu-btn-long')
        await page.evaluate( () => document.querySelector('.footer button.ivu-btn.ivu-btn-primary.ivu-btn-long').click() )
        console.log('Confirm Sell Button Clicked')

        // Wait for confirm sell to load
        await waitForResponse(page, '/app/NFTItem/status')
        console.log('Sold NFT for', username || email)

        await waitForResponse(page, '/app/NFTItem/mine')

        const newAvailNFTToSell = await getAvailNFT(page, token)

        await Accounts.updateOne({$or: [{ email: { $eq: email, $ne: '' } }, { username: { $eq: username, $ne: ''  } }]}, {
            reserve_pending: !newAvailNFTToSell ? true : false,
            sell_pending: !newAvailNFTToSell ? false : true,
            $inc: { total_sell: 1 },
            last_sell: new Date(),
            reservationBalance: reserveBalance
        })

        ++sellsDone
    }

    console.log('Sell Successful')

    const isWithinLast48Hours = ( (new Date() - new Date(reg_date)) / (1000 * 60 * 60) ) <= 48

    await sendTGMessage(
        `
        ${isWithinLast48Hours ? 'NEW!!! ' : ''}Sell successful for ${username || email}. Sold(${sellsDone-1}).\nIP: ${ipAddress}
        `
    )
}

module.exports = sellNFT