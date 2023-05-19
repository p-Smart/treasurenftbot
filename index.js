require('dotenv').config()
const express = require('express')
const app = express()
const KeepAppAlive = require('./routes/KeepAppAlive')
const connectToDB = require('./config/dbConnect')
const Accounts = require('./models/Accounts')
const axios = require('axios')
const ReserveNft = require('./routes/ReserveNFT')
const SellNFT = require('./routes/SellNFT')
const UploadAccountsHTML = require('./routes/UploadAccountsHTML')
const UploadAccounts = require('./routes/UploadAccounts')


app.use(async (_, __, next) => {
    await connectToDB()
    next()
})

app.use(express.urlencoded({ extended: true }))


app.get('/', KeepAppAlive)



app.get('/reserve-nft', ReserveNft)


app.get('/sell-nft', SellNFT)

app.get('/upload-accounts', UploadAccountsHTML)

app.post('/upload-accounts', UploadAccounts)


app.get('/test', async (_, res) => {
    // const response = await Accounts.findOne({
    //     reserve_pending: true,
    //     total_reserved: {$lt: 4},
    //     next_reserve_start: {$lte: new Date()},
    //     next_reserve_end: {$gte: new Date()}
    // })

    // const response2 = await Accounts.findOne({
    //     sell_pending: true,
    //     total_sell: {$lt: 4},
    //     next_sell_start: {$lte: new Date()},
    // })
    const response = await Accounts.updateOne({email: 'psmart2002@gmail.com'}, {
        reserve_pending: false,
        sell_pending: true,
        $inc: { total_reserved: 1 }
    })

    res.json({
        data: response
    })

    // const response = await Accounts.create({
    // email: 'psmart2002@gmail.com',
    // username: 'psmart2002',
    // password: 'PrAnnie_2018',
    // total_reserved: 0,
    // total_sell: 0,
    // reserve_pending: true,
    // sell_pending: false,
    // next_reserve_start: new Date(new Date().setHours(8, 0, 0, 0)),
    // next_reserve_end: new Date(new Date().setHours(12, 0, 0, 0)),
    // next_sell_start: new Date(new Date().setHours(13, 30, 0, 0)),
    // })
    // try{
    //     const {data} = await axios.get('https://treasurenft.xyz/gateway/app/user/code?action=register&account=psmart2002@gmail.com&countryName=Taiwan&type=MAIL',{
    //         headers: {
    //             referer: 'https://treasurenft.xyz/',
    //             "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    //         }
    //     })
    //     if(data?.message === 'SUCCESS'){
    //         res.json({
    //             data: data
    //         })
    //     }
    //     else{
    //         res.json({
    //             message: 'Duplicate'
    //         })   
    //     }
    // }
    // catch(err){
    //     res.status(500).json({
    //         error: {
    //             message: err.message
    //         }
    //     })
    // }
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



app.listen(process.env.PORT || 3000, () => console.log(`Server running...`))

