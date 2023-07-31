const connToPuppeteer = require("../config/pupConnect")
const Accounts = require("../models/Accounts")


const login =  async (email, password, res, page) => {

    res.json({
        success: true,
        message: 'Passed Job on to Puppeteer...'
    })

    // So that it redirects to login view
    await page.goto('https://treasurenft.xyz/#/uc/userCenter')
    console.log('Gone to website')

    await page.waitForSelector('.ivu-input.ivu-input-default')

    // Type in Username and Password Input Field
    await page.evaluate((email, password) => {
        const emailInput = document.querySelectorAll('input.ivu-input.ivu-input-default')[0]
        const passwordInput = document.querySelectorAll('input.ivu-input.ivu-input-default')[1]
      
        emailInput.value = email;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      
        passwordInput.value = password;
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));

        // Click on Login
        let loginButton = document.querySelector(`button.ivu-btn.ivu-btn-primary.ivu-btn-long`)
        loginButton.click()
    }, email, password);
    console.log('Typed Details')

    var loginToken
    await page.waitForResponse(async (response) => {
        if(response.url().includes('https://treasurenft.xyz/gateway/app/user/login')){
            var {data, message} = await response.json()
            loginToken = data?.token
            if (message === 'ACCOUNT_NOT_EXIST' || message === 'ACCOUNT_STATUS_DISABLE'){
                await Accounts.updateOne({
                    $or: [{ email: { $eq: email, $ne: '' } }, { username: { $eq: email, $ne: ''  } }]
               }, {incorrect_details: true})
            }

            return response.status() === 200 && message === 'SUCCESS'
        }
        return false
    } )
    console.log('Logged In Successfully')


    return {
        token: loginToken
    }
}


module.exports = login