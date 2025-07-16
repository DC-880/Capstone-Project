const mysql = require('mysql2');
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();


app.use(cors());


app.use(express.json()); 

console.log('DB Config:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});


const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});

connection.connect((error) => {
    if(error) console.log(error);
    else  console.log('Connected!')
});





module.exports = connection;