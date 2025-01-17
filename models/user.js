/** User class for message.ly */

const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");

/** User of the site. */

class User {

/** register new user 
 *    returns: {username, password, first_name, last_name, phone}  */
  static async register({username, password, first_name, last_name, phone}) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        throw new ExpressError("Username and password required", 400);
      }
      // hash password
      const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

      // save to db
    const result = await db.query(
      `INSERT INTO users 
            (username,
             password,
             first_name,
             last_name,
             phone)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]);

      return result.rows[0];
    } catch (err) {
      if (err.code === '23505') {
        return next(new ExpressError("Username taken. Please pick another!", 400));
      }
      return next(err)
    }
  }




  /** Authenticate: is this username/password valid? Returns boolean. */
  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password
      FROM users
      WHERE username = $1`, 
      [$1=username]
    );
    const user = result.row[0];

    return await bcrypt.compare(password, user.password)
   }




  /** Update last_login_at for user */
  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1`, 
      [username]
    );
   }



  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */
  static async all() {
    const result = await db.query(
      `SELECT (
          username, 
          first_name,
          last_name, 
          phone,
          join_at,
          last_login_at)
      FROM users
      `);
      return result.rows[0]
   }



  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */
  static async get(username) {
    const result = await db.query(
      `SELECT (
          username, 
          first_name,
          last_name, 
          phone,
          join_at,
          last_login_at)
        FROM users
        WHERE username = $1`,
        [username]
    );
    let user = result.rows[0];

    if (!user) {
      throw new ExpressError(`No such user: ${username}`, 404);
    };

    return user;
   }



  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */
  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT 
          m.id,
          m.to_username,
          u.first_name,
          u.last_name,
          u.phone,
          m.body,
          m.sent_at,
          m.read_at
      FROM messages AS m
        JOIN users AS u ON m.to_username = u.username
      WHERE from_username = $1`,
  [username]);

  if (!result.rows) {
    throw new ExpressError(`No such messages from ${username}`, 404);
  }

const messages = result.rows.map(row => ({
  id: row.id,
  to_user: {
    username: row.to_username,
    first_name: row.first_name,
    last_name: row.last_name,
    phone: row.phone,
  },
  body: row.body,
  sent_at: row.sent_at,
  read_at: row.read_at,
  }));

  return messages;
}



  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */
  static async messagesTo(username) {
    const result = await db.query(
      `SELECT 
          m.id,
          m.to_username,
          u.first_name,
          u.last_name,
          u.phone,
          m.body,
          m.sent_at,
          m.read_at
      FROM messages AS m
        JOIN users AS u ON m.from_username = u.username
      WHERE to_username = $1`,
  [username]);

  if (!result.rows) {
    throw new ExpressError(`No such messages to: ${username}`, 404);
  }

  const messages = result.rows.map(row => ({
    id: row.id,
    from_user: {
      username: row.from_username,
      first_name: row.first_name,
      last_name: row.last_name,
      phone: row.phone,
    },
    body: row.body,
    sent_at: row.sent_at,
    read_at: row.read_at,
    }));

    return messages;
  };
};


module.exports = User;