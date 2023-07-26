const { whatReservation } = require("../components/reservationTimeRange");
const Accounts = require("../models/Accounts");



const UploadAccounts = async ({body, ...req}, res) => {
    try{
        const duplicate = await Accounts.findOne({email: body.email})
        if(duplicate){
            return res.json({
                success: false,
                message: 'Duplicate Account'
            })
        }
        await Accounts.create({
            email: body.email,
            username: body.username,
            password: body.password,
            total_reserved: 0,
            total_sell: 0,
            reserve_pending: true,
            sell_pending: false,
            last_reserve: new Date(new Date().setDate(new Date().getDate() - 1)),
            last_sell: new Date(new Date().setDate(new Date().getDate() - 1)),
            morning_reservation: whatReservation() === 'MORNING',
            evening_reservation: whatReservation() === 'EVENING',
            reg_date: new Date(),
        });
      
        res.json({
            success: true,
            message: 'Account Created Successfully'
        })
    }
    catch(err){
        res.status(500).json({
            error: {
                message: err.message
            }
        })
    }
}


module.exports = UploadAccounts