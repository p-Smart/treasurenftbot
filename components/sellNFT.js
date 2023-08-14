const Accounts = require("../models/Accounts")
const getAvailNFT = require("./getAvailNFTToSell")
const getReservationBal = require("./getReservationBal")
const sendTGMessage = require("./sendTGMessage")
const waitForResponse = require("./waitForResponse")




const sellNFT = async (page, token, email, username) => {

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
        await sendTGMessage(`No NFT to sell for ${username || email}`)
        return console.log('No NFT to sell')
    }


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

    await Accounts.updateOne({$or: [{ email: { $eq: email, $ne: '' } }, { username: { $eq: username, $ne: ''  } }]}, {
        reserve_pending: true,
        sell_pending: false,
        $inc: { total_sell: 1 },
        last_sell: new Date(),
        reservationBalance: reserveBalance
    })

    console.log('Sell Successful')
    await sendTGMessage(`Sell successful for ${username || email}`)
}

module.exports = sellNFT