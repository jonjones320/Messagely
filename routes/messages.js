const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const Message = require("../models/message");



/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureCorrectUser, async (req, res, next) => {
    try {
        const message = await Message.get(req.param.id);
        return res.json({ message });
    }
    catch(error) {
        return next(error);
    }
});




/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/:from_username/to_username/body', ensureCorrectUser, async (req, res, next) => {
    try {
        const newMessage = await Message.create(req.params[from_username, to_username, body]);
        return res.json({ newMessage });
    }
    catch(error) {
        return next(error);
    }
});




/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.get('/:id', ensureCorrectUser, async (req, res, next) => {
    try {
        await Message.markRead(req.params.id);
        return res.json( message, "Success")
    }
    catch(error) {
        return next(error);
    }
});



module.exports = router;