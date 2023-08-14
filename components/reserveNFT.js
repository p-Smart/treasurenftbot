const Accounts = require("../models/Accounts")
const getPoints = require("./GetPoints")
const signIn = require("./dailySignIn")
const getReservationBal = require("./getReservationBal")
const sendTGMessage = require("./sendTGMessage")
const waitForResponse = require("./waitForResponse")



const reserveNFT = async (page, token, email, username) => {
    await signIn(page, token)
    var reserveBalance
        reserveBalance = await getReservationBal(page, token)
        if(!reserveBalance || (parseFloat(reserveBalance) < 18)){
            await Accounts.updateOne({$or: [{ email: { $eq: email, $ne: '' } }, { username: { $eq: username, $ne: ''  } }]}, {
                last_reserve: new Date(),
                reservationBalance: reserveBalance
            })
            return console.log('Not enough balance to reserve')
        }


        await page.goto('https://treasurenft.xyz/#/store/defi')

        console.log('Gone to Reservation Page')

        await page.waitForResponse(async (response) => {
            try{
                var {message, data} = await response.json()
                if((response.url()).includes('https://treasurenft.xyz/gateway/app/reserve/deposit')){
                    const rsvBal = data?.reserveBalance
                    reserveBalance = rsvBal

                }
            }
            catch(err){}
            return (
                (response.url()).includes('https://treasurenft.xyz/gateway/app/reserve/deposit') &&
                response.status() === 200
            )
        } )

        await page.waitForSelector((`button.ivu-btn.ivu-btn-success.ivu-btn-long`))

        await page.evaluate( () => {
            const closeModal = document.querySelector('.ivu-modal-wrap.announcement-modal a.ivu-modal-close')
            closeModal && closeModal.click()
        } )

        await page.waitForFunction( () => !(document.querySelector(`button.ivu-btn.ivu-btn-success.ivu-btn-long`).disabled) )

        await page.evaluate( () => {
            const reserveButton = document.querySelector(`button.ivu-btn.ivu-btn-success.ivu-btn-long`)
            reserveButton.click()
        } )

        await page.waitForFunction(() => {
            return parseFloat(document.querySelector('.reserve-number').innerText) !== 0
        })

        await page.evaluate( () => {
            const confirmReserveButton = document.querySelector('.reserve-wrap button')
            confirmReserveButton.click()
        } )

        await waitForResponse(page, '/app/reserve/insert')

        console.log('Success')

        await Accounts.updateOne({$or: [{ email: { $eq: email, $ne: '' } }, { username: { $eq: username, $ne: ''  } }]}, {
            reserve_pending: false,
            sell_pending: true,
            $inc: { total_reserved: 1 },
            last_reserve: new Date()
        })

        console.log('Reserve Successful')
        await sendTGMessage(`Reserve successful for ${username || email}`)

        // await getPoints(page, token)
}

module.exports = reserveNFT