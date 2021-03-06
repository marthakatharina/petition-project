var spicedPg = require("spiced-pg");
var db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

module.exports.getSignatures = () => {
    return db.query(
        `SELECT signatures.id AS id, users.first AS first, users.last AS last, user_profiles.age AS age, user_profiles.city AS city, user_profiles.url AS url FROM signatures JOIN users ON signatures.user_id = users.id LEFT OUTER JOIN user_profiles ON signatures.user_id = user_profiles.user_id`
    );
};

module.exports.addSignature = (signature, user_id) => {
    return db.query(
        `
        INSERT INTO signatures (signature, user_id)
        VALUES($1, $2) RETURNING id`,
        [signature, user_id]
    ); //this is against sql injection attack, it tells which arrgument to escape (first id starts at $1 )
};

module.exports.checkIfSigned = (id) => {
    return db.query(
        `SELECT * FROM signatures WHERE user_id IN
    (SELECT id FROM users WHERE id = $1)`,
        [id]
    );
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
    return db.query(`SELECT * FROM users WHERE email = $1`, [email]);
};

module.exports.additionalInfo = (age, city, url, user_id) => {
    return db.query(
        `
        INSERT INTO user_profiles (age, city, url, user_id)
        VALUES($1, $2, $3, $4) RETURNING id`,
        [age || null, city, url, user_id]
    );
};

module.exports.getSigner = (id) => {
    return db.query(`SELECT * FROM signatures WHERE id = $1 `, [id]);
};

module.exports.countSignatures = () => {
    return db.query(`SELECT count(*) FROM signatures`);
};

module.exports.getSignersByCity = (city) => {
    return db.query(
        `SELECT signatures.id AS id, users.first AS first, users.last AS last, user_profiles.age AS age, user_profiles.city AS city, user_profiles.url AS url FROM signatures JOIN users ON signatures.user_id = users.id LEFT OUTER JOIN user_profiles ON signatures.user_id = user_profiles.user_id WHERE LOWER(city) = LOWER($1)`,
        [city]
    );
};

module.exports.letEdit = (user_id) => {
    return db.query(
        `SELECT users.first AS first, users.last AS last, users.email AS email, user_profiles.age AS age, user_profiles.city AS city, user_profiles.url AS url FROM users JOIN user_profiles ON users.id = user_profiles.user_id WHERE user_id = $1`,
        [user_id]
    );
};

module.exports.updateNoPw = (first, last, email, id) => {
    return db.query(
        `
        UPDATE users set first = $1 , last = $2, email = $3 WHERE id = $4 RETURNING id`,
        [first, last, email, id]
    );
};

module.exports.upsertInfo = (age, city, url, user_id) => {
    return db.query(
        `
        INSERT INTO user_profiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET age = $1, city = $2, url = $3
        RETURNING id
    `,
        [age || null, city, url, user_id]
    );
};

module.exports.updateWithPW = (first, last, email, password, id) => {
    return db.query(
        `
        UPDATE users
        SET first = $1, last=$2, email=$3, password=$4
        WHERE id = $5
        RETURNING *
    `,
        [first, last, email, password, id]
    );
};

exports.updatePassword = (hash, id) => {
    return db.query(`UPDATE users SET password = $1 WHERE id = $2 `, [
        hash,
        id,
    ]);
};

module.exports.deleteSignature = (user_id) => {
    return db.query(
        `
        DELETE FROM signatures WHERE user_id=$1
        `,
        [user_id]
    );
};
