const signIn = require("./dailySignIn")
const waitForResponse = require("./waitForResponse")



const getPoints = async (page, token) => {

    try{
        await page.goto('https://treasurenft.xyz/#/uc/achievement?id=daily')
        await signIn(page, token)

        await Promise.all([
            waitForResponse(page, '/app/mission/daily-list'),
            waitForResponse(page, '/app/mission/achieve-list')
        ])
        

        const handleDailyLists = async () => {
            const availablePoints = await page.evaluate( () => Array.from(document.querySelectorAll('.list-block.status-untaken')) )
            if(availablePoints.length){
                await Promise.all([
                    page.evaluate( () => Array.from(document.querySelectorAll('.list-block.status-untaken'))[0].querySelector('button').click() ),
                    waitForResponse(page, '/app/mission/take-point'),
                ])
                await waitForResponse(page, '/app/mission/daily-list')
                return await handleDailyLists()
            }
            return false
        }
        await handleDailyLists()

        const handleMissionLists = async () => {
            const availablePoints = await page.evaluate( () => Array.from(document.querySelectorAll('.mission-block.status-untaken')) )
            if(availablePoints.length){
                await Promise.all([
                    page.evaluate( () => Array.from(document.querySelectorAll('.mission-block.status-untaken'))[0].querySelector('button').click() ),
                    waitForResponse(page, '/app/mission/take-point'),
                ])
                await waitForResponse(page, '/app/mission/achieve-list')
                return await handleMissionLists()
            }
            return false
        }
        await handleMissionLists()
    }
    catch(err){
        console.log(err.message)
    }

    console.log('Done getting points')
}

module.exports = getPoints