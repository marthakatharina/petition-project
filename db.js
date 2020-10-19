var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getSignatures = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.addSignature = (signature) => {
    return db.query(
        `
        INSERT INTO signatures (signature)
        VALUES($1) RETURNING id`,
        [signature]
    ); //this is against sql injection attack, it tells which arrgument to escape (first id starts at $1 )
};

module.exports.getUsers = () => {
    return db.query(`SELECT * FROM users`);
};

module.exports.addUser = (first, last, email, password, created_at) => {
    return db.query(
        `
        INSERT INTO users (first, last, email, password, created_at)
        VALUES($1, $2, $3, $4, $5) RETURNING id`,
        [first, last, email, password, created_at]
    ); //this is against sql injection attack, it tells which arrgument to escape (first id starts at $1 )
};

module.exports.getSigner = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.countSignatures = () => {
    return db.query(`SELECT count(*) FROM signatures`);
};
