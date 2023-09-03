const Accounts = require("../models/Accounts")
const getPoints = require("./GetPoints")
const { computeBestReservation, computeUrlToWaitFor, computeReservation, mapRangeToPrice } = require("./computeBestReservation")
const signIn = require("./dailySignIn")
const fetchIp = require("./fetchIp")
const getReservationBal = require("./getReservationBal")
const LARGE_NUMBER = require("./largeNumber")
const sendTGMessage = require("./sendTGMessage")
const waitForResponse = require("./waitForResponse")



const reserveNFT = async (page, token, details) => {
    var {username, email, reg_date, _id} = details
    await signIn(page, token)
    console.log('Signed In')
    var reserveBalance
        reserveBalance = await getReservationBal(page, token)
        if(!reserveBalance || (parseFloat(reserveBalance) < 18)){
            await Accounts.updateOne({$or: [{ email: { $eq: email, $ne: '' } }, { username: { $eq: username, $ne: ''  } }]}, {
                last_reserve: new Date(),
                reservationBalance: reserveBalance
            })
            return console.log('Not enough balance to reserve')
        }

        await Promise.all([
            page.goto('https://treasurenft.xyz/#/store/defi', {waitUntil: 'networkidle0'}),
            page.waitForResponse(async (response) => {
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
        ])
        console.log('Gotten to reservation page')

        const reservationRangesDone = []

        var count = 0
        while(reserveBalance >= 18){
            var {total_reserved, maxReserves} = await Accounts.findOne({_id: _id})

            reserveBalance = await getReservationBal(page, token)
            console.log('Reserve balance', reserveBalance)

            if(maxReserves!==LARGE_NUMBER){
                var bestRange = computeReservation({
                    totalReservesNeeded: maxReserves,
                    totalReservesDone: total_reserved,
                    rangesDone: reservationRangesDone,
                    reservationBalance: reserveBalance
                })
                console.log(`Best range for total of ${maxReserves} reserves ${bestRange}`)

                if(!bestRange) break
            }
            else{
                var bestRange = computeBestReservation(reserveBalance)
                console.log('Best reservation range', bestRange)

                const rangeDone = reservationRangesDone.find( (range) =>  range === bestRange)

                if(rangeDone){
                    bestRange = computeBestReservation(reserveBalance, rangeDone, reservationRangesDone.length)
                    console.log('New best range', bestRange)

                    if(!bestRange) break
                }
            }
            
            if (reserveBalance < 18){
                break
            }

            await page.waitForSelector('.ivu-select-item')
            await page.waitForSelector(`.ivu-select-dropdown-list :nth-child(${bestRange})`)
            console.log('Waited for Range selectors')

            await page.evaluate( (bestRange) => {
                const rangeButton = document.querySelector(`.ivu-select-dropdown-list :nth-child(${bestRange})`)
                rangeButton && rangeButton.click()
            }, bestRange )
            console.log('Range button clicked')

            if(!(count === 0 && bestRange === 1)){
                await waitForResponse(page, computeUrlToWaitFor(bestRange))
                console.log('Waited for range response')
            }

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
            console.log('Reservation', count+1, 'done')

            reservationRangesDone.push(bestRange)
            ++count;
        }
        
        console.log(reservationRangesDone.length, 'Reserve(s) Successful')

        const isWithinLast48Hours = ( (new Date() - new Date(reg_date)) / (1000 * 60 * 60) ) <= 48

        const ipAddress =  await fetchIp(page)
        await sendTGMessage(`
        ${isWithinLast48Hours ? 'NEW!!! ' : ''}Reserve successful for ${username || email}. Reserved (${reservationRangesDone.length}): [${reservationRangesDone.map( (range) =>  mapRangeToPrice(range))}].\nIP: ${ipAddress}
        `)

        // await getPoints(page, token)
}

module.exports = reserveNFT