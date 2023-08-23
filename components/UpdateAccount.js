const Accounts = require("../models/Accounts")
const getUplineId = require("./getUplineId")
const getRandomViewport = () => {
    const minWidth = 786
    const maxWidth = 1920
  
    const randomWidth = Math.floor(Math.random() * (maxWidth - minWidth + 1)) + minWidth
  
    return {
      width: randomWidth,
      height: 768,
      deviceScaleFactor: 1,
    }
}
  


const updateAccount = async (browser, email, username, userIDFromDB, token, isUpdateRoute) => {

    var page2 = await browser.newPage()
    await page2.setViewport(getRandomViewport())

        
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
        var UID

        const referrals = await page2.evaluate( async (token) => {
            const url = "https://treasurenft.xyz/gateway/app/group/member-list?type=direct"

            const fetchData = async () => {
            try {
                const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                })

                if (!response.ok) {
                throw new Error("Network response was not ok.")
                }

                const data = await response.json()
                return data.data.pageList.map( ({userId, account, userName}) => {
                    return {
                        UID: userId,
                        username: (account === userName) ? account : userName
                    }
                } )
            } catch (error) {
                await fetchData()
            }
            }
            const referrals = await fetchData()
            return referrals

        }, token )

        if(!balance || !income){
            const balanceResponse = await page2.evaluate( () => {
                const balance =  document.querySelector('h3.title-black-PR-26.text').textContent
                const earnings = document.querySelector('.income-info-area > :nth-child(2) h4.title-black-PR-18').textContent
                return {balance, earnings}
            })
            balance = balanceResponse?.balance
            income = balanceResponse?.earnings
        }

        const { userId } = await page2.evaluate(() => {
            const closeModals = () => {
                const closeModal = document.querySelector('.ivu-modal-wrap.announcement-modal')
                if(closeModal){
                    closeModal.style.display = 'none'
                }
                const closeModalMask = Array.from( document.querySelectorAll('.ivu-modal-mask') ).filter( (el) => el.style.display === '' )[0]
                if(closeModalMask){
                    closeModalMask.style.display = 'none'
                }
            }
            closeModals()
          
            const userIdElement = document.querySelector('.info-area-UID :nth-child(2)');
            const userId = userIdElement ? userIdElement.textContent : ''
          
            return {
              userId: userId,
            };
        })
        UID = userId

        const {uplineUID, uplineUsername} = await getUplineId(userIDFromDB || UID )

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
            UID: UID || userIDFromDB,
            ...base64String && {image: base64String},
            referrals: referrals && referrals,
            uplineUID: uplineUID,
            uplineUsername: uplineUsername,
            ...isUpdateRoute && {last_update: new Date(),}
        })
        return page2
}

module.exports = updateAccount