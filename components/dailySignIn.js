


const signIn = async (page, token) => {
    return await page.evaluate( async (token) => {
        const url = 'https://treasurenft.xyz/gateway/app/user/sign-in';

        const data = await ( await fetch(url, {
            method: 'POST',
            headers: {
                "Authorization": token,
            },
        }) ).json()
        return data
    }, token )
}

module.exports = signIn