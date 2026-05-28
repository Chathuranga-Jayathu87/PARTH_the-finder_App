require('dotenv').config();
const { Pool } = require('pg');

// Supabase Connection Pooling සඳහා pool එකක් සාදාගැනීම
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Cloud deployments (Render to Supabase) වලදී මේක අනිවාර්යයි
    },
    max: 10, // කලින් තිබ්බ connectionLimit: 10 එකට සමානයි
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Connection එක සාර්ථකද කියා පරීක්ෂා කිරීම
pool.connect()
    .then(client => {
        console.log("Connected to Supabase (PostgreSQL) Database Successfully!!");
        client.release(); // Connection එක ආපහු pool එකට නිදහස් කිරීම
    })
    .catch(err => {
        console.error("Error Connecting to Supabase: ", err.message);
    });

module.exports = pool;