const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const secretKey = 'battleship_2024';


exports.userWithHashedPassword = async (user) => {

    user.password = await this.hashPassword(user.password);
    return user;
};


exports.hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);

};

exports.getToken = async (user) => {
    return jwt.sign(
        {id : user.id, username: user.username, email: user.email},
        secretKey,
        {expiresIn: '1h'}
    );
}


exports.verifyToken = (req, res, next) => {
    const token = req.get('Authorization');

    if (token) {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(401).json({message: 'Invalid Token'});
            }
            req.username = decoded.username;
            req.email = decoded.email;
            next();
        });
    } else {
        return res.status(401).json({ message: 'Token not provided' });
    }
};
