const { default: axios } = require("axios")

const TG_API_ROUTE = 'https://api.telegram.org/bot6284939193:AAFBIC-WQr9i3_r4kWCCbgh35MBNHN9Hlcw/sendPhoto'; // Use sendPhoto method

const sendTGImage = async (base64Image, caption='', tries = 0) => {
    try {
        const formData = new FormData();

        formData.append("chat_id", 5669189826);
        formData.append("photo", base64Image); // Attach the image
        formData.append("caption", caption);

        const { data } = await axios.post(TG_API_ROUTE, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return data;
    } catch (err) {
        if ((err.message).includes('connect ETIMEDOUT') && tries < 5) {
            await sendTGImage(base64Image, caption, ++tries);
        }
        console.error(err.message)
        console.error(err.response.data)
    }
}

module.exports = sendTGImage