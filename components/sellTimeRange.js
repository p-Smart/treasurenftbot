


const isTimeToSell = () => {
    // Get the current date and time
    const currentDate = new Date();

    // Convert the current time to Nigerian time
    const nigerianTime = new Date(currentDate.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));

    // Get the current hour and minute in Nigerian time
    const currentHour = nigerianTime.getHours();
    const currentMinute = nigerianTime.getMinutes();

    // Check if the current time is within the desired time ranges
    
    const isWithinTimeRange =
    (currentHour === 13 && currentMinute >= 40) ||
    (currentHour === 14) ||
    (currentHour === 15 && currentMinute <= 40) ||

    (currentHour === 22 && currentMinute >= 40) ||
    (currentHour === 23) ||
    (currentHour === 0 && currentMinute <= 40)

    return isWithinTimeRange
}

module.exports = isTimeToSell