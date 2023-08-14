

const waitForResponse = async (page, url) => {
    await page.waitForResponse(async (response) => {
        try{
            var {message} = await response.json()
        }
        catch(err){}
        return (
            (response.url()).includes(url) &&
            response.status() === 200 && 
            message === 'SUCCESS'
        )
    } )
}

module.exports = waitForResponse