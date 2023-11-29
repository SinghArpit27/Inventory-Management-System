const jwt = require('jsonwebtoken');

// Authentication Access Token
const authenticateToken = (req, res, next) => {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== "undefined") {
        const bearer = bearerHeader.split(" ");
        const token = bearer[1];

        jwt.verify(token, process.env.ACCESS_JWT_SECRET, (err, decoded) => {
            if (err) {
                res.status(403).json({ result: "Error: Invalid Token" });
            } else {
                const user = decoded; // The user data decoded from the token
                req.uuid = user.uuid;
                next();
            }
        });
    } else {
        res.send({
            result: "Token Not Found",
        });
    }
};

module.exports = authenticateToken;