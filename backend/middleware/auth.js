const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header or query string
    let token = '';
    const authHeader = req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.query.token) {
        token = req.query.token;
    }

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_token_key');
        req.user = decoded.user;
        console.log(`[AUTH] Success for user ${req.user.id} on ${req.method} ${req.url}`);
        next();
    } catch (err) {
        console.log(`[AUTH] Failed: ${err.message} on ${req.method} ${req.url}`);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
