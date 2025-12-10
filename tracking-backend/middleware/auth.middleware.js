const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // 1. Get the token from the Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if(!token){
        return res.status(401).json({error: 'Access denied. No token provided.'});
    }

    try{
        //2. verify the token using the JWT secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //3. Attach the user info to the request object
        req.user = decoded;

        //4. Proceed to the next middleware or route handler
        next();

    }catch(ex){
        // catch the error if token is invalid or expired
        res.status(400).json({error: 'Invalid token.'});

    }
    
};

module.exports = auth;


