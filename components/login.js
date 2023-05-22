const connToPuppeteer = require("../config/pupConnect")
const defaultTimeout = 30000


const login =  async (email, password, res) => {
    const browser = await connToPuppeteer()

    const page = await browser.newPage()
    await page.setDefaultTimeout(defaultTimeout)
    await page.setRequestInterception(true);

    res.json({
        success: true,
        message: 'Passed Reserve Job on to Puppeteer...'
    })

    await page.on('request', (request) => {
        if (
          request.resourceType() === 'image' ||
          request.resourceType() === 'video'
        ) {
          request.abort();
        } else {
          request.continue();
        }
    })


    await page.goto('https://treasurenft.xyz/')
    console.log('Gone to website')

    // Click on Account Menu (to Login)
    await page.evaluate( () => {
        let menu = document.querySelectorAll('.menu-wrap-item')
        let loginMenu = Array.from(menu)[1]
        loginMenu.click()
        return
    } )

    await page.waitForSelector('.ivu-input.ivu-input-default')

    // Type in Userbame and Password Input Field

    const inputs = await page.$$('.ivu-input.ivu-input-default');
    for (let i = 0; i < inputs.length; i++) {
    if (i === 0) {
        await inputs[i].type(email, {delay: 50});
    } else if (i === 1) {
        await inputs[i].type(password, {delay: 50});
    }
    }
    console.log('Typed Details')

    // Click on Login
    await page.evaluate( () => {
        let loginButton = document.querySelector(`button.ivu-btn.ivu-btn-primary.ivu-btn-long`)
        loginButton.click()
    } )

    await page.waitForFunction(() => !document.querySelector('.loginModal'))
    console.log('Logged In Successfully')


    return {
        browser: browser,
        page: page
    }
}


module.exports = login