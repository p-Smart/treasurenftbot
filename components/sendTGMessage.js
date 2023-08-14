const { default: axios } = require("axios");



const TG_API_ROUTE = 'https://api.telegram.org/bot6284939193:AAFBIC-WQr9i3_r4kWCCbgh35MBNHN9Hlcw/sendMessage'


const sendTGMessage = async (message, tries=0) => {

    try{
        var formData = new FormData();

        formData.append("chat_id", 5669189826);
        formData.append("text", message);
        formData.append("parse_mode", "HTML");

        const {data} = await axios.post(TG_API_ROUTE, formData, {
            headers: {'Access-Control-Allow-Origin' : '*'}
        })
        return data
    }
    catch(err){
        if((err.message).includes('connect ETIMEDOUT') && tries < 5){
            await sendTGMessage(message, ++ tries)
        }
    }
}

module.exports = sendTGMessage