require('dotenv').config()
const Pool = require('pg').Pool

const pool = new Pool({
    user: process.env.dbUser,
    password: process.env.dbPassword,
    host: process.env.dbHost,
    port: process.env.dbPort,
    database: process.env.dbName
})

module.exports = pool

/*
cd C:\Program Files\PostgreSQL\14\bin
.\psql --version
psql -U dbUser
\l - показать список существующих БД
create database dbName;
\connect dbName; // подключиться к бд jwtauth
\dt - показать отношения внутри бд
*/