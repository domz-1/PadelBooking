const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 500 // limit each IP to 500 requests per minute
});

module.exports = limiter;
