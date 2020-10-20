const bcrypt = require("bcryptjs");
let { genSalt, hash, compare } = bcrypt;
const { promisify } = require("util");

genSalt = promisify(genSalt);
hash = promisify(hash);
compare = promisify(compare);

module.exports.compare = compare;

module.exports.hash = (password) =>
    genSalt().then((salt) => hash(password, salt));

// password stands lainTextPassword and for "safePassword" which is hard-coded

// genSalt()
//     .then((salt) => {
//         console.log("salt from genSalt:", salt);
//         return hash("safePassword", salt);
//     })
//     .then((hashedPw) => {
//         console.log("hash and salted pw:", hashedPw);
//         return compare("safePassword", hashedPw);
//     })
//     .then((matchValueOfCompare) => {
//         console.log("Is this the correct password?", matchValueOfCompare);
//     });
