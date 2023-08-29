const availableRanges = [4, 3, 2, 1]
const mapRangeToPrice = (range) => {
    return range===4 ? 300+2 : range===3 ? 150+2 : range===2 ? 50+2 : range===1 ? 18+2 : false
}
const checkIfInRange = (reservationBalance, range) => {
    return (
        (range === 4 && reservationBalance >= 300 + 2) ||
        (range === 3 && reservationBalance >= 150 + 2) ||
        (range === 2 && reservationBalance >= 50 + 2) ||
        (range === 1 && reservationBalance >= 18 + 2) || false
    )
}


const computeBestReservation = (reservationBalance, rangeDone, reservesDone) => {
    
    if(reservationBalance >= 300){
        if(rangeDone === 4){
            return 4 - reservesDone
        }
        return 4
    }
    else if ((reservationBalance >= 150  && reservationBalance <= 299.999)){
        if(rangeDone === 3){
            return 3 - reservesDone
        }
        return 3
    }
    else if (reservationBalance >= 50  && reservationBalance <= 149.999){
        if(rangeDone === 2){
            return 2 - reservesDone
        }
        return 2
    }
    else if ((reservationBalance >= 18  && reservationBalance <= 49.999)){
        if(rangeDone === 1){
            return false
        }
        return 1
    }

    return false
}


const computeReservation = (props={
    totalReservesNeeded: 4,
    totalReservesDone: 0,
    reservationBalance: 0,
    rangesDone: [], 
}) => {
    const {
        totalReservesNeeded,
        totalReservesDone,
        reservationBalance,
        rangesDone
    } = props

    const reservesLeft = (totalReservesNeeded - totalReservesDone) - 1

    switch (true) {
        case checkIfInRange(reservationBalance, 4) && !(rangesDone.includes(4)) && canReserve(rangesDone, reservesLeft, reservationBalance - mapRangeToPrice(4)):
            return 4
        
        case checkIfInRange(reservationBalance, 3) && !(rangesDone.includes(3)) && canReserve(rangesDone, reservesLeft, reservationBalance - mapRangeToPrice(3)):
            return 3
        
        case checkIfInRange(reservationBalance, 2) && !(rangesDone.includes(2)) && canReserve(rangesDone, reservesLeft, reservationBalance - mapRangeToPrice(2)):
            return 2

        case checkIfInRange(reservationBalance, 1) && !(rangesDone.includes(1)) && canReserve(rangesDone, reservesLeft, reservationBalance - mapRangeToPrice(1)):
            return 1
    
        default:
            return false
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


const canReserve = (rangesDone, reservesLeft, reservationBalLeft) => {
    if(reservesLeft===0){
        return true
    }
    const allRanges = generateCombinations(availableRanges, reservesLeft, 2)
    const sievedRanges = allRanges.filter( (rangesArr, k) => {
        const occurrencesArr = []
        for (let i = 0; i < rangesDone.length; i++){
            occurrencesArr.push( countOccurrences(rangesArr, rangesDone[i]) )
        }
        return occurrencesArr.every( (occurence) => occurence < 2 )
    } )

    const pricesTotal = sievedRanges.map( (rangeArr) => 
    (rangeArr.map( (range) => mapRangeToPrice(range) )).reduce((total, price) => total + price, 0) )

    return pricesTotal.some( (price) => (reservationBalLeft - price) >= 0 )
}






const generateCombinations = (arr, length, maxRepetitionOfValues, startIndex = 0, currentCombination = [], result = []) => {
    if (currentCombination.length === length) {
        result.push([...currentCombination]);
        return;
    }

    for (let i = startIndex; i < arr.length; i++) {
        const occurrences = countOccurrences(currentCombination, arr[i]);
        if (occurrences < maxRepetitionOfValues && occurrences < Math.min(arr.length, maxRepetitionOfValues)) {
            generateCombinations(arr, length, maxRepetitionOfValues, i, [...currentCombination, arr[i]], result);
        }
    }

    return result;
}

const countOccurrences = (arr, value) => {
    return arr.filter(item => item === value).length;
}



module.exports = {
    computeBestReservation,
    computeUrlToWaitFor,
    computeReservation,
    mapRangeToPrice
}