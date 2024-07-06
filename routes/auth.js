const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");



/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */
router.post('/register', async (req, res, next) => {
try {
    const { username, password } = req.body;
    if (!username || !password) {
    throw new ExpressError("Username and password required", 400);
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    // save to db
    const results = await db.query(`
        INSERT INTO users (username, password)
        VALUES ($1, $2)
        RETURNING username`,
        [username, hashedPassword]);
    
    // update last login 
    User.updateLoginTimestamp(username);

    return res.json(results.rows[0]);
} catch (e) {
    if (e.code === '23505') {
    return next(new ExpressError("Username taken. Please pick another!", 400));
    }
    return next(e)}
});



/** POST /login - login: {username, password} => {token} **/
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            throw new ExpressError("Username and password required", 400);
        }
        const results = await db.query(
            `SELECT username, password 
            FROM users
            WHERE username = $1`,
            [username]);

        const user = results.rows[0];

        if (user) {
            if (await bcrypt.compare(password, user.password)) {
                const token = jwt.sign({ username }, SECRET_KEY);

                // update last login 
                User.updateLoginTimestamp(username);
                return res.json({ message: `Logged in!`, token })
            }
        }
        throw new ExpressError("Invalid username/password", 400);
    } catch (e) {
        return next(e);
    }}
);


