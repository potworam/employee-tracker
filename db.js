const mysql = require("mysql");
const prompts = require("./lib/prompts.js")
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.host,
    port: process.env.port,
    user: process.env.username,
    password: process.env.password,
    database: process.env.database
});

connection.connect(function(err){
    if(err) throw err;
    console.log("connected as id" + connection.threadId + "\n");
    prompts.firstQ();
});

exports.connection = connection 