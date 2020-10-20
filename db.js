var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getSignatures = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.addSignature = (signature, user_id) => {
    return db.query(
        `
        INSERT INTO signatures (signature, user_id)
        VALUES($1, $2) RETURNING id`,
        [signature, user_id]
    ); //this is against sql injection attack, it tells which arrgument to escape (first id starts at $1 )
};

module.exports.getUsers = () => {
    return db.query(`SELECT * FROM users`);
};

module.exports.addUser = (first, last, email, password) => {
    return db.query(
        `
        INSERT INTO users (first, last, email, password)
        VALUES($1, $2, $3, $4) RETURNING id`,
        [first, last, email, password]
    ); //this is against sql injection attack, it tells which arrgument to escape (first id starts at $1 )
};

module.exports.userInfo = (email) => {
    return db.query(`SELECT * FROM users WHERE email = '${email}'`);
};

module.exports.getSigner = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.countSignatures = () => {
    return db.query(`SELECT count(*) FROM signatures`);
};
