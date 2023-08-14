

const defaultTimeout = 30000

const setPageSettings = async (page, showMedia) => {

    page.setDefaultTimeout(defaultTimeout)

    if(!showMedia){
        await page.setRequestInterception(true)

        page.on('request', (request) => {
            if (
            request.resourceType() === 'image' ||
            request.resourceType() === 'media'
            ) {
            request.abort();
            } else {
            request.continue();
            }
        })
    }
}

module.exports = setPageSettings