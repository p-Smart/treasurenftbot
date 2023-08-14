

const getReservationBal = async (page, token) => {
    return await page.evaluate( async (token) => {
        const url = 'https://treasurenft.xyz/gateway/app/reserve/deposit?index=0&startPrice=0.9&endPrice=18'

        const {data} = await ( await fetch(url, {
            method: 'GET',
            headers: {
                "Authorization": token,
            },
        }) ).json()
        return data?.reserveBalance
    }, token )
}

module.exports = getReservationBal