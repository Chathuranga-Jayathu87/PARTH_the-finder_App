const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // ඔයාගේ නිවැරදි db.js path එක දාන්න
const saltRounds = 10;

// Email validation regex
const isValidEmail = (email) => {
    if (typeof email !== 'string') {
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
};

// Password validation regex
const isValidPassword = (password) => {
    if (typeof password !== 'string') {
        return false;
    }
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/;
    return passwordRegex.test(password) && password.length >= 8 && password.length <= 128;
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password, phone_number } = req.body;

    // 1. Validate Input
    if (!email || !password || !name) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (!isValidEmail(email) || !isValidPassword(password)) {
        return res.status(400).json({ message: 'Invalid email or password format.' });
    }

    try {
        // 2. Hash the Password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 3. Check if user already exists (? වෙනුවට $1 සහ [existingUsers] වෙනුවට { rows })
        const checkQuery = 'SELECT user_id FROM users WHERE email = $1';
        const { rows: existingUsers } = await pool.query(checkQuery, [email]);

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Email already registered.' });
        }

        // 4. Insert the new user (? වෙනුවට $1, $2, $3, $4)
        const insertQuery = `INSERT INTO users (name, email, password_hash, phone_number) VALUES ($1, $2, $3, $4)`;
        await pool.query(insertQuery, [name, email, hashedPassword, phone_number]);

        res.status(201).json({ message: 'User registered successfully!' });

    } catch (error) {
        // Postgres වල unique constraint violation (duplicate key) එකට එන්නේ error code '23505'
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Email already registered.' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // 1. Validate Input
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and Password are required or invalid.' });
    }

    try {
        // 2. Get user by email (? වෙනුවට $1 සහ [rows] වෙනුවට { rows })
        const { rows } = await pool.query('SELECT user_id, password_hash FROM users WHERE email = $1', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid email.' });
        }

        // 3. Compare Passwords
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password.' });
        }

        // 4. Generate JWT Token
        const token = jwt.sign(
            { user_id: user.user_id, email: email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 5. Send success response with token
        res.json({
            message: 'Login successful',
            token: token,
            user_id: user.user_id
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

module.exports = router;