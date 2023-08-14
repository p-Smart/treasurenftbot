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
const { whatReservation } = require('./components/reservationTimeRange')
const DisplayAccounts = require('./routes/DisplayAccounts')
const getUplineId = require('./components/getUplineId')
const DisplayDoneAccounts = require('./routes/DisplayDoneAccounts')
const connToPuppeteer = require('./config/pupConnect')
const login = require('./components/login')
const getPoints = require('./components/GetPoints')
const getReservationBal = require('./components/getReservationBal')
const { setAllWorkingFalse } = require('./components/Working')
const sendTGMessage = require('./components/sendTGMessage')


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
    // const {browser, page} = await connToPuppeteer()

    // var {token} = await login('adaonyeala@gmail.com', 'Adaonyeala1234', res, page)

    // await getPoints(page, token)
    // console.log(await getReservationBal(page, token))

    // document.querySelector('.ivu-select-dropdown-list :nth-child(1)').click()
    // const result = await sendTGMessage('Reserve done for MEEE')

    // res.json({
    //   success: true,
    //   result
    // })
  }
  catch(err){
    console.error(err.message)
  }
  finally{

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

