const Accounts = require('../models/Accounts')
const isTimeToSell = require('../components/sellTimeRange')
const { getStartOfYesterDay, getEndOfYesterday } = require('../components/dates')
const login = require('../components/login')

const SellNFT = async (req, res) => {
    const restartDate = new Date('2023-07-25T11:19:45.736+00:00')
    try{
        if(!isTimeToSell()){
            return res.json({
                success: false,
                message: 'Not Sell Time'
            })
        }

        const account = (await Accounts.aggregate([
            { $match: {
                sell_pending: true,
                total_sell: {$lt: 2},
                last_sell: { $gte: getStartOfYesterDay(), $lt: getEndOfYesterday() },

                reg_date: {$gt: restartDate},
            } },
            { $sample: { size: 1 } }
        ]))[0]

        if(!account){
            return res.json({
                success: false,
                message: 'No Pending Sell'
            })
        }

        const {email, password} = account
        // const {email, password} = {email: 'adelowosam13@exdonuts.com', password: 'AdelowoSam1234'}
        console.log('Sell')
        console.log(email)

        var {browser, page, token} = await login(email, password, res)

        await page.waitForFunction(() => !document.querySelector('.loginModal'))


        await Promise.all([
            page.goto('https://treasurenft.xyz/#/collection', {timeout: 0}),
            page.waitForResponse(async (response) => {
                try{
                    var {message} = await response.json()
                }
                catch(err){}
                return (
                    (response.url()).includes('https://treasurenft.xyz/gateway/app/order/message-list') && 
                    response.status() === 200 && 
                    message === 'SUCCESS'
                )
            } )
        ])
        console.log('Loaded collection page')

        // try{
        //     await page.waitForSelector('.ivu-modal-wrap.announcement-modal a.ivu-modal-close', {timeout: 5000})
        // }
        // catch(err){}
        // await page.evaluate( () => {
        //     const closeModal = document.querySelector('.ivu-modal-wrap.announcement-modal a.ivu-modal-close')
        //     closeModal && closeModal.click() 
        // } )
        // console.log('Modal closed')

        
        console.log('Reservations Tab loaded')
        
        await page.waitForSelector(`.ivu-tabs-nav :nth-child(3)`)
        await page.evaluate( () => document.querySelector(`.ivu-tabs-nav :nth-child(3)`).click() )
        console.log('Clicked Collected Tab')

        var nftAvailableToSell = true
        await page.waitForResponse(async (response) => {
            try{
                var {message, data} = await response.json()
                if(data.total === 0 || data.totalPages === 0){
                    nftAvailableToSell = false
                }
            }
            catch(err){}
            return (
                (response.url()).includes('https://treasurenft.xyz/gateway/app/NFTItem/mine') && 
                response.status() === 200 && 
                message === 'SUCCESS'
            )
        } )
        console.log('Collected Tab loaded')

        if(!nftAvailableToSell){
            await Accounts.updateOne({ email: email }, {
                reserve_pending: true,
                sell_pending: false,
                $inc: { total_sell: 1 },
                last_sell: new Date()
            })
            return console.log('No NFT to collect')
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
        await page.waitForResponse(async (response) => {
            try{
                var {message} = await response.json()
            }
            catch(err){}
            return (
                (response.url()).includes('https://treasurenft.xyz/gateway/app/NFTItem/status') &&
                response.status() === 200 && 
                message === 'SUCCESS'
            )
        } )
        console.log('Sold NFT for', email)


        await Accounts.updateOne({ email: email }, {
            reserve_pending: true,
            sell_pending: false,
            $inc: { total_sell: 1 },
            last_sell: new Date()
        })

        console.log('Sell Successful')
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


module.exports = SellNFT