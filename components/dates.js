const nigeriaTimeZone = 'Africa/Lagos'


const getStartOfYesterDay = () => {
    const todayNow = new Date( new Date().toLocaleString('en-US', {timeZone: nigeriaTimeZone}) )
    const yesterdayNow = new Date(todayNow.setDate(new Date().getDate() - 1))
    yesterdayNow.setHours(0, 0, 0, 0)
    return yesterdayNow
}

const getEndOfYesterday = () => {
    const todayNow = new Date( new Date().toLocaleString('en-US', {timeZone: nigeriaTimeZone}) )
    const yesterdayNow = new Date(todayNow.setDate(new Date().getDate() - 1))
    yesterdayNow.setHours(23, 59, 59, 999)
    return yesterdayNow
}


module.exports = {
    getStartOfYesterDay: getStartOfYesterDay,
    getEndOfYesterday: getEndOfYesterday
}