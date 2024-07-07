const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const User = require("../models/user");



/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/', ensureLoggedIn, async (req, res, next) => {
    try {
      const users = await User.all();
      return users;
    } 
    catch (e) {
      return next(new ExpressError("Please login first!", 401));
    }
});



/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username', ensureCorrectUser, async (req, res, next) => {
  const user = res.user;
  if (user === undefined) {
    throw new ExpressError("User not found", 404)
  }
  try {
    const user = await User.get(username);
    return res.json({ user });
  } 
  catch(e) {
    return next(e);
  }
});



/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', ensureCorrectUser, async (req, res, next) => {
  const user = res.user;
  if (user === undefined) {
    throw new ExpressError("User not found", 404)
  }
  try {
    const messages = await User.messagesTo;
    return res.json({ messages });
  } 
  catch(e) {
    return next(e);
  }
});



/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from', ensureCorrectUser, async (req, res, next) => {
  const user = res.user;
  if (user === undefined) {
    throw new ExpressError("User not found", 404)
  }
  try {
    const messages = await User.messagesFrom;
    return res.json({ messages });
  } 
  catch(e) {
    return next(e);
  }
});
