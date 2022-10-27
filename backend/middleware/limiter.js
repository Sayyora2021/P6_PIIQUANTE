const rateLimit = require('express-rate-limit');

//creation de rate-limiter
const limit = rateLimit;

module.exports=rateLimit ({
   
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10,              // Limit each IP to 10 requests per 'window', per 15 minutes
        standardHeaders: true, //Return rate limit info in the 'RateLimit_*' headers
        leagcyHeaders: false,  //Disable the 'X-RateLimit -*' headers
        message: "Try again in 15 minutes", 
        
});
