


const UploadAccountsHTML = (req, res) => {
    try{
        const html = `
        <html>
        <body>
            <form method="POST" action="/upload-accounts">
            <label for="email">Email:</label>
            <input type="email" name="email" id="email" required><br><br>
            
            <label for="username">Username:</label>
            <input type="text" name="username" id="username" required><br><br>
            
            <label for="password">Password:</label>
            <input type="text" name="password" id="password" required><br><br>
            
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


module.exports = UploadAccountsHTML