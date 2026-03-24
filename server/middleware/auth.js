const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const header = req.header('Authorization') || req.headers.authorization;
        const token = header?.toString().replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No authentication token provided' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.Jwt_sec || 'your-secret-key');
            const userId = decoded.userId || decoded.id || decoded._id;
            if (!userId) {
                return res.status(401).json({ message: 'Invalid authentication token payload' });
            }

            const user = await User.findById(userId).select('-password');
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            req.token = token;
            req.user = user;
            return next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({ message: 'Invalid authentication token' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ message: 'Please authenticate' });
    }
};

module.exports = auth;