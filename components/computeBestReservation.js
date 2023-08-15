


const computeBestReservation = (reservationBalance) => {
    
    if(reservationBalance >= 300){
        return 4
    }
    else if (reservationBalance >= 150  && reservationBalance <= 299.999){
        return 3
    }
    else if (reservationBalance >= 50  && reservationBalance <= 149.999){
        return 2
    }
    else if (reservationBalance >= 18  && reservationBalance <= 49.999){
        return 1
    }
}

const computeUrlToWaitFor = (range) => {
    if(range === 1){
        return '/app/reserve/deposit?index=0&startPrice=0.9&endPrice=18'
    }
    else if (range === 2){
        return '/app/reserve/deposit?index=1&startPrice=18&endPrice=50'
    }
    else if (range === 3){
        return '/app/reserve/deposit?index=2&startPrice=50&endPrice=150'
    }
    else if (range === 4){
        return '/app/reserve/deposit?index=3&startPrice=150&endPrice=300'
    }
}

module.exports = {
    computeBestReservation,
    computeUrlToWaitFor
}