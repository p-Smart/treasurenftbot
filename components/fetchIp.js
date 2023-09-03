


const fetchIp = async (page) => {
    return await page.evaluate( async () => {
        const url = 'https://api.ipify.org/'

        const response = await ( await fetch(url, {
            method: 'GET',
        }) ).text()
        return response
    } )
}

module.exports = fetchIp