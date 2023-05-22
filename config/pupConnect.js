const pup = require('puppeteer-core')
const {BROWSERLESS_KEY} = process.env
const executablePath = `C:/Users/Prince/.cache/puppeteer/chrome/win64-113.0.5672.63/chrome-win64/chrome.exe`



const connToPuppeteer = async () => {
    // const browser = await pup.launch({
    //     headless: false,
    //     executablePath: executablePath,
    //     defaultViewport: { width: 1500, height: 736 }
    // })

    const browser = await pup.connect({
        browserWSEndpoint: `wss://chrome.browserless.io?token=${BROWSERLESS_KEY}`,
        defaultViewport: { width: 1500, height: 736 },
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }, {timeout: 0})
    return browser
}


module.exports = connToPuppeteer