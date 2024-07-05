/** Database connection for messagely. */


const { Client } = require("pg");
const { DB_URI } = require("./config");

// const client = new Client(DB_URI);

// client.connect();

let db = new Client({
    connectionString: DB_URI
  });
  
db.connect()
    .then(() => console.log('Connected to the database'))
    .catch(err => console.error('Connection error', err));;

module.exports = db;
