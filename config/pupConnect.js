const pup = require('puppeteer-core')
const {BROWSERLESS_KEY} = process.env
const executablePath = `C:/Users/Prince/.cache/puppeteer/chrome/win64-113.0.5672.63/chrome-win64/chrome.exe`


const defaultTimeout = 30000

const connToPuppeteer = async () => {
    // const browser = await pup.launch({
    //     headless: false,
    //     executablePath: executablePath,
    //     defaultViewport: { width: 468, height: 736 }
    // })

    const browser = await pup.connect({
        browserWSEndpoint: `wss://chrome.browserless.io?token=${BROWSERLESS_KEY}`,
        defaultViewport: { width: 468, height: 736 },
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
    }, {timeout: 0})
    console.log('Browser opened')

    const page = await browser.newPage()
    page.setDefaultTimeout(defaultTimeout)
    await page.setRequestInterception(true)

    page.on('request', (request) => {
        if (
          request.resourceType() === 'image' ||
          request.resourceType() === 'media'
        ) {
          request.abort();
        } else {
          request.continue();
        }
    })
    
    return {
        browser,
        page
    }
}


module.exports = connToPuppeteer