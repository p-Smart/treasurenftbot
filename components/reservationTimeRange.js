


const getNigerianTime = () => {
    const currentDate = new Date();
    const nigerianTime = new Date(currentDate.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
    return {
        hour: nigerianTime.getHours(),
        minute: nigerianTime.getMinutes(),
    }
}




const isReservationTime = () => {
    const {hour} = getNigerianTime()
    const isWithinTimeRange = (hour >= 8 && hour < 12) || (hour >= 17 && hour < 21);
    return isWithinTimeRange
}

const isMorningReservationTime = () => {
    const {hour} = getNigerianTime()
    const isWithinTimeRange = (hour >= 8 && hour < 12);
    return isWithinTimeRange
}

const isEveningReservationTime = () => {
    const {hour} = getNigerianTime()
    const isWithinTimeRange = (hour >= 17 && hour < 21);
    return isWithinTimeRange
}

const whatReservation = () => {
    const {hour} = getNigerianTime()
    if (hour >= 9 && hour < 12) {
        return 'MORNING';
    } 
    else {
        if ((hour === 12 && minute >= 0) || (hour > 12 && hour < 21)) {
            return 'EVENING'
        } 
        else {
            return 'MORNING'
        }
    }
}

module.exports = {
    isReservationTime: isReservationTime,
    isMorningReservationTime: isMorningReservationTime,
    isEveningReservationTime: isEveningReservationTime,
    whatReservation: whatReservation,
}