const Accounts = require("../models/Accounts");

const convertDate = (date) => new Date(date).toLocaleString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
});



const DisplayAccounts = async ({ query }, res) => {
    const restartDate = new Date('2023-07-25T11:19:45.736+00:00')
    try {
        const accounts = await Accounts.find({
            owner: query.owner || 'prince',
            reg_date: { $gt: restartDate }
        })
        .sort({ reg_date: -1 })


        const html = `
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    padding: 10px;
                    background-color: #f2f2f2;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    background-color: #fff;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                th, td {
                    padding: 10px;
                    border-bottom: 1px solid #ddd;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                }
                @media screen and (max-width: 600px) {
                    th, td {
                        padding: 8px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
            <h3>Total Accounts: ${accounts.length}</h3>
                ${accounts
                    .map(
                        (item) => `
                        <table>
                            <tr>
                                <th>Email</th>
                                <td>${item.email}</td>
                            </tr>
                            <tr>
                                <th>Username</th>
                                <td>${item.username}</td>
                            </tr>
                            <tr>
                                <th>Password</th>
                                <td>${item.password}</td>
                            </tr>
                            <tr>
                                <th>Total Reserved</th>
                                <td>${item.total_reserved}</td>
                            </tr>
                            <tr>
                                <th>Total Sell</th>
                                <td>${item.total_sell}</td>
                            </tr>
                            <tr>
                                <th>Reserve Pending</th>
                                <td>${item.reserve_pending}</td>
                            </tr>
                            <tr>
                                <th>Sell Pending</th>
                                <td>${item.sell_pending}</td>
                            </tr>
                            <tr>
                                <th>Last Reserve</th>
                                <td>${convertDate(item.last_reserve)}</td>
                            </tr>
                            <tr>
                                <th>Last Sell</th>
                                <td>${convertDate(item.last_sell)}</td>
                            </tr>
                            <tr>
                                <th>Morning Reservation</th>
                                <td>${item.morning_reservation}</td>
                            </tr>
                            <tr>
                                <th>Evening Reservation</th>
                                <td>${item.evening_reservation}</td>
                            </tr>
                            <tr>
                                <th>Last Airdrop Check</th>
                                <td>${item.last_airdrop_check || 'Not Updated Yet'}</td>
                            </tr>
                            <tr>
                                <th>Last Balance Update</th>
                                <td>${(item.last_balance_update && convertDate(item.last_balance_update) ) || 'Not Updated Yet'}</td>
                            </tr>
                            <tr>
                                <th>Balance</th>
                                <td>${item.balance || 'Not Updated Yet'}</td>
                            </tr>
                            <tr>
                                <th>Earnings</th>
                                <td>${item.earnings || 'Not Updated Yet'}</td>
                            </tr>
                            <tr>
                                <th>Registration Date</th>
                                <td>${convertDate(item.reg_date)}</td>
                            </tr>
                            <tr>
                                <th>Owner</th>
                                <td>${item.owner}</td>
                            </tr>
                            <tr>
                                <th>Profile Image</th>
                                <td>
                                <div style="width: 266.67px; height: 200px; border-radius: 15px; overflow: hidden;">
                                    <img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="Account Image">
                                </div>
                                </td>
                            </tr>
                        </table>
                        <br>
                    `
                    )
                    .join("")}
            </div>
        </body>
        </html>
    `;
    res.send(html);
    } catch (err) {
        console.error(err.message)
        res.json({
            error: {
                message: err.message
            }
        })
    }
}

module.exports = DisplayAccounts;
