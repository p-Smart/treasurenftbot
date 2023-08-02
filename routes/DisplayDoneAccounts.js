const Accounts = require("../models/Accounts");
const Style = require("../styles/displaypage");

const convertDate = (date) => new Date(date).toLocaleString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZone: "Africa/Lagos",
});
const ITEMS_PER_PAGE = 10;



const DisplayDoneAccounts = async ({ query }, res) => {
    const restartDate = new Date('2023-07-25T11:19:45.736+00:00')
    const twenty4HoursInMilliscs = 24 * 60 * 60 * 1000;
    const mdbQuery = {
        owner: query.owner || 'prince',
        reg_date: { $gt: restartDate },
        level0: {$ne: true},
        $or: [
            {total_sell: {$gte: 2}},
            {account_done: true}
        ],
        $expr: {
            $gte: [{ $subtract: [new Date(), "$last_sell"] }, twenty4HoursInMilliscs]
        },

        balance: {$lt: 50},
        uplineUID: {$nin: ['', null, undefined]}
    }
    try {
        var {page = 1} = query
        page = parseInt(page)


        const totalAccounts = await Accounts.countDocuments(mdbQuery);

        const accounts = await Accounts.find(mdbQuery)
        .sort([
            [ 'balance', -1 ],
            [ 'earnings', -1 ],
          ])
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);

        const totalPages = Math.ceil(totalAccounts / ITEMS_PER_PAGE)


        const html = `
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
            ${Style()}
        </head>
        <body>
            <div class="container">
            <h3>Total Accounts: ${totalAccounts}</h3>
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
                                <th>UID</th>
                                <td>${item.UID || 'Not Updated Yet'}</td>
                            </tr>
                            <tr>
                                <th>Upline Username</th>
                                <td>${item.uplineUID || 'Not Updated Yet'}</td>
                            </tr>
                            <tr>
                                <th>Upline UID</th>
                                <td>${item.uplineUsername || 'Not Updated Yet'}</td>
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


                    <div class="pagination">
                    ${Array.from({ length: totalPages }).map((_, index) => {
                        const pageNumber = index + 1;
                        return `
                        <button class="${pageNumber === page ? 'active' : ''}" onclick="gotoPage(${pageNumber})">
                            ${pageNumber}
                        </button>
                        `;
                    }).join("")}
                </div>
            </div>



            <script>
            function gotoPage(page) {
                const currentURL = new URL(window.location.href);
                const queryParams = currentURL.searchParams;
            
                queryParams.set('page', page);
            
                currentURL.search = queryParams.toString();
                window.location.href = currentURL.toString();
            }
            
            </script>
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

module.exports = DisplayDoneAccounts;
