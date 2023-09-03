require('dotenv').config()
const express = require('express')
const app = express()
const KeepAppAlive = require('./routes/KeepAppAlive')
const connectToDB = require('./config/dbConnect')
const ReserveNft = require('./routes/ReserveNFT')
const SellNFT = require('./routes/SellNFT')
const UploadAccountsHTML = require('./routes/UploadAccountsHTML')
const UploadAccounts = require('./routes/UploadAccounts')
const Accounts = require('./models/Accounts')
const GetAirdrops = require('./routes/GetAirdrops')
const UpdateAccount = require('./routes/UpdateAccount')
const mongoose = require('mongoose')
const DisplayAccounts = require('./routes/DisplayAccounts')
const ClaimBonus = require('./routes/ClaimBonus')
const genRandomDevice = require('./components/generateRandomDevice')
const sendTGImage = require('./components/sendTGImage')
const connToPuppeteer = require('./config/pupConnect')
const fetchIp = require('./components/fetchIp')


connectToDB()


app.use(express.urlencoded({ extended: true }))


app.get('/', KeepAppAlive)



app.get('/reserve-nft', ReserveNft)


app.get('/sell-nft', SellNFT)

app.get('/upload-accounts', UploadAccountsHTML)

app.post('/upload-accounts', UploadAccounts)

app.get('/get-airdrops', GetAirdrops)

app.get('/update-account', UpdateAccount)

app.get('/display/all', DisplayAccounts)

app.get('/claim-bonus', ClaimBonus)

app.get('/display/level0', (req, res, next) => {
  req.query.level0 = true
  next()
}, DisplayAccounts)

app.get('/display/sorted', (req, res, next) => {
  req.query.sorted = true
  next()
}, DisplayAccounts)


app.get('/test', async (_, res) => {
  try{
    var {browser, page} = await connToPuppeteer()
    await page.goto('https://api.ipify.org/')
    const result =  await fetchIp(page)

    return res.json({
      success: true,
      result
    })
  }
  catch(err){
    console.error(err.message)
  }
  finally{
    await page?.close()
    await browser?.close()
  }
})






















app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
})
  
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      error: {
        message: `You're lost, man!`
      }
    });
    next()
})



const listen = () => {
  mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'))
  mongoose.connection.once('open', () => {
    console.log('Connected to mongoDB')
    app.listen(process.env.PORT || 3005, () => console.log(`Server running...`))
  })
}


listen()

