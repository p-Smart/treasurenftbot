const mongoose = require('mongoose')
const connection = {}
const connectToDB = async () => {
    try{
        if (connection.isConnected) {
            return 'Connected to MongoDB'
        }
        const db = await mongoose.connect(process.env.MONGODB_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        })
        connection.isConnected = db.connections[0].readyState
        return 'Connected to MongoDB'
    }
    catch(err){
        console.error(err)
    }
}


module.exports = connectToDB