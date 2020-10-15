var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getSignatures = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.addSignature = (first, last, signature) => {
    return db.query(
        `
        INSERT INTO signatures (first, last, signature)
        VALUES($1, $2, $3)`,
        [first, last, signature]
    ); //this is against sql injection attack, it tells which arrgument to escape (first id starts at $1 )
};
