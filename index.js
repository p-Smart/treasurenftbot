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
const UpdateBalance = require('./routes/UpdateBalance')


// app.use(async (_, __, next) => {
//     await connectToDB()
//     next()
// })
connectToDB()


app.use(express.urlencoded({ extended: true }))


app.get('/', KeepAppAlive)



app.get('/reserve-nft', ReserveNft)


app.get('/sell-nft', SellNFT)

app.get('/upload-accounts', UploadAccountsHTML)

app.post('/upload-accounts', UploadAccounts)

app.get('/get-airdrops', GetAirdrops)

app.get('/update-balance', UpdateBalance)


// app.get('/test', async (_, res) => {
//   const result = await Accounts.updateMany( {morning_reservation: true}, {
//     last_balance_update: new Date(new Date().setDate(new Date().getDate() - 1))
//     // earnings: 0
//     })
//   // const result = await Accounts.find( {reserve_pending: true, sell_pending: false})
//   // const result = await Accounts.find( {evening_reservation: true})

//   res.json({
//     success: true,
//     result: result
//   });
// })






















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



app.listen(process.env.PORT || 3000, () => console.log(`Server running...`))

