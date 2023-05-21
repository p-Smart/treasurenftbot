


const isReservationTime = () => {
    const currentDate = new Date();

    // Convert the current time to Nigerian time
    const nigerianTime = new Date(currentDate.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));

    // Get the current hour in Nigerian time
    const currentHour = nigerianTime.getHours();

    // Check if the current hour is within the desired time range
    const isWithinTimeRange = (currentHour >= 8 && currentHour < 12) || (currentHour >= 17 && currentHour < 21);

    return isWithinTimeRange
}

const isMorningReservationTime = () => {
    const currentDate = new Date();

    // Convert the current time to Nigerian time
    const nigerianTime = new Date(currentDate.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));

    // Get the current hour in Nigerian time
    const currentHour = nigerianTime.getHours();

    // Check if the current hour is within the desired time range
    const isWithinTimeRange = (currentHour >= 8 && currentHour < 12);

    return isWithinTimeRange
}

const isEveningReservationTime = () => {
    const currentDate = new Date();

    // Convert the current time to Nigerian time
    const nigerianTime = new Date(currentDate.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));

    // Get the current hour in Nigerian time
    const currentHour = nigerianTime.getHours();

    // Check if the current hour is within the desired time range
    const isWithinTimeRange = (currentHour >= 17 && currentHour < 21);

    return isWithinTimeRange
}

module.exports = {
    isReservationTime: isReservationTime,
    isMorningReservationTime: isMorningReservationTime,
    isEveningReservationTime: isEveningReservationTime
}