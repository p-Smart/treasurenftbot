


const getAvailNFT = async (page, token) => {
    return await page.evaluate( async (token) => {
        const url = 'https://treasurenft.xyz/gateway/app/NFTItem/mine?page=1&size=10&status=PENDING'

        const {data} = await ( await fetch(url, {
            method: 'GET',
            headers: {
                "Authorization": token,
            },
        }) ).json()
        return data?.total || data?.totalPages
    }, token )
}

module.exports = getAvailNFT