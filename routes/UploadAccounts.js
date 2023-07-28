const { whatReservation } = require("../components/reservationTimeRange");
const Accounts = require("../models/Accounts");



const UploadAccounts = async ({body, ...req}, res) => {
    try{
        let {username, email, password, total_reserved, total_sell, reserve_pending, sell_pending, reservation, owner} = body

        const duplicate = await Accounts.findOne({
             $or: [{ email: { $eq: email, $ne: '' } }, { username: { $eq: username, $ne: ''  } }] 
        })
          
        if(duplicate){
            return res.json({
                success: false,
                message: 'Duplicate Account'
            })
        }
        await Accounts.create({
            email: email || '',
            username: username || '',
            password: password,
            total_reserved: total_reserved || 0,
            total_sell: total_sell || 0,
            reserve_pending: reserve_pending === 'false' ? false : true,
            sell_pending: sell_pending === 'true' ? true : false,
            last_reserve: new Date(new Date().setDate(new Date().getDate() - 1)),
            last_sell: new Date(new Date().setDate(new Date().getDate() - 1)),
            morning_reservation: reservation === 'MORNING' ||  whatReservation() === 'MORNING',
            evening_reservation: reservation === 'EVENING' || whatReservation() === 'EVENING',
            reg_date: new Date(),
            owner: owner,
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