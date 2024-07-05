/** Common config for message.ly */

// read .env files and make environmental variables

require('dotenv').config();

const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const dbname = process.env.DB_NAME;

const DB_URI = (process.env.NODE_ENV === "test")
  ? `postgresql://${username}:${password}@localhost:5432/${dbname}_test`
  : `postgresql://${username}:${password}@localhost:5432/${dbname}`;

const SECRET_KEY = process.env.SECRET_KEY || "secret";

const BCRYPT_WORK_FACTOR = 12;


module.exports = {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
};