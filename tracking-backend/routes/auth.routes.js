const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const saltRounds = 10;


    //Email validation regex
    const isValidEmail = (email) => {
        if(typeof email !== 'string') {
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email.length <= 255;
    };


    //Password validation function
    const isValidPassword = (password) => {
        if(typeof password !== 'string') {
            return false;
        }
        return password.length >= 8 && password.length <= 128; //Minimum length requirement
    };

    //POST /api/auth/register
    router.post('/register', async(req, res) => {
    const { name,email, password, phone_number} = req.body;

    
    //1. Validate Input
    if(!email || !password || !name ){
        return res.status(400).json({message: 'Name, email, and password are required.'});

    }

    if(!isValidEmail(email) || !isValidPassword(password)){
        return res.status(400).json({message: 'Invalid email or password format.'});
    }



    try{
        //2. Hash the Password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        //3.check if user already exists
        const checkQuery = 'SELECT user_id FROM users WHERE email = ?';
        const [existingUsers] = await pool.query (checkQuery, [email]);

        if(existingUsers.length > 0){
            return res.status(409).json({error: 'Email already registered.'});
        }
    
        //4. Insert the new user
        const insertQuery = ` INSERT INTO users (name, email, password_hash, phone_number) VALUES (?, ?, ?, ?)`;
        await pool.query(insertQuery, [name, email, hashedPassword, phone_number || null]);
        
        res.status(201).json({message: 'User registered successfully!'});
    
    }catch(error){
       
        if(error.code === 'ER_DUP_ENTRY'){
            return res.status(409).json({message: 'Email already registered. '});
        }
        console.error('Registration error:', error);
        res.status(500).json({message: 'Server error during registration. '});
         
    }
})

//POST /api/auth/login
router.post('/login', async(req, res) => {
    const{ email, password } = req.body;


    //1. Validate Input
    if(!email || !password ){
        return res.status(400).json({message: 'Email and Password are required or invalid. '});
    }

    if(!isValidEmail(email) || !isValidPassword(password)){
        return res.status(400).json({message: 'Invalid email or password format.'});
    }

    try{
        //1. Get user by email
        const [rows] = await pool.query('SELECT user_id, password_hash FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if(!user){
            return res.status(401).json({message: 'Invalid email.'})
        }

        //2. Compare Passwords
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if(!isMatch){
            return res.status(401).json({message: 'Invalid password.'});
        }

        //3. Generate JWT Token
        const token = jwt.sign(
            { user_id: user.user_id, email: email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        //4. Send success response with token
        res.json({ message: 'Login successful',
                token: token,
                user_id: user.user_id 
            });

    }catch(error){
        console.error('Login error:', error);
        res.status(500).json({error: 'Server error during login.'});

    }


});

module.exports = router;