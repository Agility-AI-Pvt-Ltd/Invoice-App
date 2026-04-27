import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
    try {
        const header = req.header('Authorization') || req.headers.authorization;
        const token = header?.toString().replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No authentication token provided' });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET environment variable is not set');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        try {
            const decoded = jwt.verify(token, jwtSecret);
            const userId = decoded.userId || decoded.id || decoded._id;
            if (!userId) {
                return res.status(401).json({ message: 'Invalid authentication token payload' });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Remove password from user object
            if (user.password) delete user.password;

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

export default auth;