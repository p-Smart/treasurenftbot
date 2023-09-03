const pup = require('puppeteer-core')
const setPageSettings = require('../components/setPageSettings')
const genRandomDevice = require('../components/generateRandomDevice')
const {BROWSERLESS_KEY} = process.env
const executablePath = `C:/Users/Prince/.cache/puppeteer/chrome/win64-113.0.5672.63/chrome-win64/chrome.exe`


const connToPuppeteer = async (width, height, showMedia) => {
  var browser
  if(process.env.DEV || !process.env.PRODUCTION){
    browser = await pup.launch({
      headless: process.env.DEV ? false : 'new',
      executablePath: executablePath,
      defaultViewport: { width: width || 468, height: height || 736 },
      devtools: process.env.DEV ? true : false,
  })
  }
  if(process.env.PRODUCTION){
    browser = await pup.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${BROWSERLESS_KEY}`,
      defaultViewport: { width: width || 468, height: height || 736 },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
    }, {timeout: 0})
  }
    console.log('Browser opened')
    
    const context = await browser.createIncognitoBrowserContext()
    const page = await context.newPage()

    await setPageSettings(page, showMedia)
    await page.emulate(genRandomDevice())
    
    return {
        browser,
        context,
        page,
        
    }
}


module.exports = connToPuppeteer