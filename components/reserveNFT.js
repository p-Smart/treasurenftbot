const Accounts = require("../models/Accounts")
const getPoints = require("./GetPoints")
const { computeBestReservation, computeUrlToWaitFor } = require("./computeBestReservation")
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
                if((response.url()).includes('/app/reserve/deposit')){
                    const rsvBal = data?.reserveBalance
                    reserveBalance = rsvBal

                }
            }
            catch(err){}
            return (
                (response.url()).includes('/app/reserve/deposit') &&
                response.status() === 200
            )
        } )

        const reservationRangesDone = []

        while(reserveBalance >= 18){
            reserveBalance = await getReservationBal(page, token)

            var bestRange = computeBestReservation(reserveBalance)

            const rangeDone = reservationRangesDone.find( (range) =>  range === bestRange)

            if(rangeDone){
                bestRange = computeBestReservation(reserveBalance, rangeDone)

                if(!bestRange) break
            }
            
            if (reserveBalance < 18){
                break
            }

            await page.waitForSelector('.ivu-select-item')
            await page.waitForSelector(`.ivu-select-dropdown-list :nth-child(${bestRange})`)

            await page.evaluate( (bestRange) => {
                const rangeButton = document.querySelector(`.ivu-select-dropdown-list :nth-child(${bestRange})`)
                rangeButton && rangeButton.click()
            }, bestRange )

            await waitForResponse(page, computeUrlToWaitFor(bestRange))

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

            await Accounts.updateOne({$or: [{ email: { $eq: email, $ne: '' } }, { username: { $eq: username, $ne: ''  } }]}, {
                reserve_pending: false,
                sell_pending: true,
                $inc: { total_reserved: 1 },
                last_reserve: new Date()
            })

            reservationRangesDone.push(bestRange)
        }

        console.log('Reserve Successful')
        await sendTGMessage(`Reserve successful for ${username || email}. Reserved (${reservationRangesDone.length})`)

        // await getPoints(page, token)
}

module.exports = reserveNFT