/** This file is for the connection to the database in postgreSQL */

const {Client} = require('pg')

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "root",
    database: "postgres"
})

module.exports = client;