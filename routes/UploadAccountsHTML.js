const { whatReservation } = require("../components/reservationTimeRange");



const UploadAccountsHTML = ({query}, res) => {
    try{
        const html = `
        <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1 user-scalable=no" />
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    padding: 10px;
                    background-color: #f2f2f2;
                }
                form {
                    max-width: 400px;
                    margin: auto;
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: bold;
                }
                input[type="text"],
                input[type="email"],
                input[type="number"] {
                    width: 100%;
                    padding: 8px;
                    margin-bottom: 15px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    box-sizing: border-box;
                }
                input[type="radio"] {
                    margin-right: 5px;
                }
                button {
                    display: block;
                    background-color: #4CAF50;
                    color: #fff;
                    padding: 10px 15px;
                    margin: 10px 0;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <form method="POST" action="/upload-accounts">
                <label for="username">Username:</label>
                <input type="text" name="username" id="username" required>
                
                <label for="email">Email:</label>
                <input type="email" name="email" id="email">
                
                <label for="password">Password:</label>
                <input type="text" name="password" id="password" required>
                
                <label for="total_reserved">Total Reserved:</label>
                <input type="number" name="total_reserved" id="total_reserved" value="0">
                
                <label for="total_sell">Total Sell:</label>
                <input type="number" name="total_sell" id="total_sell" value="0">
                
                <label for="reserve_pending">Reserve Pending:</label>
                <input type="radio" name="reserve_pending" value="true" checked>True
                <input type="radio" name="reserve_pending" value="false">False
                
                <label for="sell_pending">Sell Pending:</label>
                <input type="radio" name="sell_pending" value="true">True
                <input type="radio" name="sell_pending" value="false" checked>False
                
                <label for="owner">Owner:</label>
                <input type="radio" name="owner" value="prince" ${(query.owner==='prince' || query.owner !== 'queen') && 'checked'}>Prince
                <input type="radio" name="owner" value="queen" ${query.owner==='queen' && 'checked'}>Queen
                
                <button type="submit">Submit</button>
                
            </form>
        </body>
        </html>
    `;
    res.send(html);
    }
    catch(err){
        console.error(err.message)
        res.json({
            error: {
                message: err.message
            }
        })        
    }
}

module.exports = UploadAccountsHTML;
