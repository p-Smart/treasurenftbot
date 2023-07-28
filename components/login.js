const connToPuppeteer = require("../config/pupConnect")


const login =  async (email, password, res, browserConfig) => {
    if (browserConfig){
        const {width, height, showMedia} = browserConfig
        var {browser, page} = await connToPuppeteer(width, height, showMedia)
    }
    else{
        var {browser, page} = await connToPuppeteer()
    }

    res.json({
        success: true,
        message: 'Passed Reserve Job on to Puppeteer...'
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
        try{
            var {data, message} = await response.json()
            loginToken = data.token
        }
        catch(err){}
        return (
            response.url() === 'https://treasurenft.xyz/gateway/app/user/login' && 
            response.status() === 200 && 
            message === 'SUCCESS'
        )
    } )
    console.log('Logged In Successfully')


    return {
        browser: browser,
        page: page,
        token: loginToken
    }
}


module.exports = login