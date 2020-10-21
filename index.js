const express = require("express");
const app = express();
const db = require("./db");
const handlebars = require("express-handlebars");
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const bcrypt = require("./bc");

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

app.use(
    cookieSession({
        secret: `The revolution will be live-streamed.`,
        maxAge: 1000 * 60 * 60 * 24 * 14, // two weeks in milliseconds, they reset back to zero after this time has passed
    })
);

// app.use(cookieParser());

app.use(express.urlencoded({ extended: false }));

// app.use(csurf());

// app.use(function (req, res, next) {
//     // this type of middleware runs for every route
//     res.setHeader("x-frame-options", "DENY"); // or "SAMEORGIN"
//     next();
// });

app.use(express.static("./public"));

app.get("/", (req, res) => {
    if (!req.session.userId) {
        // (!req.cookies.authenticated)
        res.redirect("/register");
    } else {
        res.redirect("/login");
        console.log("already registered / redirected to login");
    }
});

app.get("/register", (req, res) => {
    res.render("register", {
        layouts: "main",
    });
});

app.post("/register", (req, res) => {
    const { firstname, lastname, email, password } = req.body;

    if (firstname && lastname && email && password) {
        db.userInfo(email).then(({ rows }) => {
            if (rows.length === 0) {
                bcrypt
                    .hash(password)
                    .then((hash) => {
                        db.addUser(firstname, lastname, email, hash)
                            .then(({ rows }) => {
                                console.log("rows: ", rows);
                                req.session.userId = {
                                    id: rows[0].id,
                                    firstname: firstname,
                                    lastname: lastname,
                                    email: email,
                                };

                                res.redirect("/profile");
                            })
                            .catch((err) => {
                                console.log("err in addUser:", err);
                            });

                        // res.cookie("authenticated", true);
                    })
                    .catch((err) => {
                        console.log("err in userInfo:", err);
                    });
            }
        });
        // .catch((err) => {
        //     console.log("err in POST :", err);
        // });
    } else if (!firstname || !lastname || !email || !password) {
        console.log("redirected");
        res.render("register", {
            errorMessage: "Something went wrong. Please try again!",
        });
    }
});

app.get("/login", (req, res) => {
    if (req.session.userId) {
        res.render("login", {
            layouts: "main",
        });
    } else {
        res.redirect("/register");
        console.log("not registered / redirected to register");
    }
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    console.log("POST request made to the / login route");

    if (email && password) {
        db.userInfo(email)
            .then(({ rows }) => {
                if (rows.length !== 0) {
                    const hash = rows[0].password;
                    bcrypt.compare(password, hash).then((auth) => {
                        if (auth) {
                            req.session.userId = {
                                id: rows[0].id,
                                firstname: rows[0].first,
                                lastname: rows[0].last,
                                email: rows[0].email,
                                admin: rows[0].admin,
                            };

                            res.redirect("/petition");
                        }
                    });
                } else {
                    res.render("login", {
                        errorMessage: "Invalid login or password!",
                    });
                }
            })
            .catch((err) => {
                console.log("err in getting users cookies:", err);
            });
    } else if (!email || !password) {
        res.render("login", {
            errorMessage: "Something went wrong. Please try again!",
        });
    }
});

app.get("/profile", (req, res) => {
    if (req.session.userId) {
        res.render("profile", {
            layouts: "main",
        });
    } else {
        res.redirect("/register");
    }
});

app.post("/profile", (req, res) => {
    const { age, city, url } = req.body;
    const { id } = req.session.userId;
    // const { cookie } = req.session;

    console.log("POST request made to the / profile route");

    if (age || city || url) {
        db.additionalInfo(age, city, url, id)
            .then(({ rows }) => {
                req.session.userId = rows[0].id;
                console.log("rows: ", rows);
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("err in additionalInfo:", err);
            });
    }

    // else {
    //     console.log("redirected");
    //     res.render("petition", {
    //         errorMessage: "Something went wrong. Please try again!",
    //         // cookie,
    //     });
    // }
});

// app.get("/", (req, res) => {
//     // console.log("req.session: ", req.session);
//     // req.session.pimento = "bigSecret99"; // pimento is a value we can set whatever we want (eg. id from database?)

//     if (!req.session.signatureId) {
//         // (!req.cookies.authenticated)
//         res.redirect("/petition");
//     } else {
//         res.redirect("/petition/thanks");
//         console.log("already signed / redirected");
//     }
// });

// app.get("/petition", (req, res) => {
//     console.log("req.session: ", req.session);
//     res.render("petition", {
//         layouts: "main",
//     });
// });

app.get("/petition", (req, res) => {
    console.log("req.session: ", req.session);
    const { id } = req.session.userId;
    // const { cookie } = req.session;

    if (req.session.userId.signatureId) {
        res.redirect("/petition/thanks");
    } else {
        db.checkIfSigned(id)
            .then(({ rows }) => {
                console.log("results from checkIfSigned:", rows);
                if (rows.length === 0) {
                    res.render("petition", {
                        layouts: "main",
                        // cookie,
                    });
                } else {
                    req.session.userId.signatureId = rows[0].id;
                    res.redirect("/petition/thanks");
                }
            })
            .catch((err) => {
                console.log("err in checkIfSigned:", err);
            });
    }
});

app.post("/petition", (req, res) => {
    const { signature } = req.body;
    const { id } = req.session.userId;
    // const { cookie } = req.session;

    console.log("POST request made to the / petition route");

    if (signature) {
        db.addSignature(signature, id)
            .then(({ rows }) => {
                req.session.userId.signatureId = rows[0].id;
                console.log("rows: ", rows);
                res.redirect("/petition/thanks");
            })
            .catch((err) => {
                console.log("err in addSignature:", err);
            });
        // res.cookie("authenticated", true);
    } else {
        console.log("redirected");
        res.render("petition", {
            errorMessage: "Something went wrong. Please try again!",
            // cookie,
        });
    }
});

app.get("/petition/thanks", (req, res) => {
    // const { cookie } = req.session;
    if (req.session.userId.signatureId) {
        // (req.cookies.authenticated)
        db.countSignatures().then(({ rows }) => {
            console.log("results from countSignatures:", rows);
            const numOfSigners = rows[0].count;
            db.getSigner(req.session.userId.signatureId)
                .then(({ rows }) => {
                    console.log("results from getSigner:", rows); //
                    res.render("thanks", {
                        layouts: "main",
                        rows,
                        numOfSigners,
                        // cookie,
                    });
                })
                .catch((err) => {
                    console.log("err in countSignatures:", err);
                });
        });
    } else {
        res.redirect("/petition");
    }
});

app.get("/petition/signers", (req, res) => {
    // const { cookie } = req.session;
    if (req.session.userId.signatureId) {
        // (req.cookies.authenticated)
        db.getSignatures()
            .then(({ rows }) => {
                // results or directly {{rows}}
                console.log("results from getSignatures:", rows); // results.rows or directly rows
                res.render("signers", {
                    rows,
                    // cookie,
                });
            })
            .catch((err) => {
                console.log("err in getSignatures:", err);
            });
    } else {
        res.redirect("/petition");
    }
});

// app.post("/petition", (req, res) => {
//     const { signature } = req.body;

//     console.log("POST request made to the / petition route");

//     if (signature) {
//         db.addSignature(signature)
//             .then(({ rows }) => {
//                 req.session.signatureId = rows[0].id;
//                 console.log("rows: ", rows);
//                 res.redirect("/petition/thanks");
//             })
//             .catch((err) => {
//                 console.log("err in addSignature:", err);
//             });
//         // res.cookie("authenticated", true);
//     } else {
//         console.log("redirected");
//         res.render("petition", {
//             errorMessage: "Something went wrong. Please try again!",
//         });
//     }
// });

// app.get("/petition/thanks", (req, res) => {
//     if (req.session.signatureId) {
//         // (req.cookies.authenticated)
//         db.countSignatures().then(({ rows }) => {
//             console.log("results from countSignatures:", rows);
//             const numOfSigners = rows[0].count;
//             db.getSigner(req.session.signatureId)
//                 .then(({ rows }) => {
//                     console.log("results from getSigner:", rows); //
//                     res.render("thanks", {
//                         layouts: "main",
//                         rows,
//                         numOfSigners,
//                     });
//                 })
//                 .catch((err) => {
//                     console.log("err in countSignatures:", err);
//                 });
//         });
//     } else {
//         res.redirect("/petition");
//     }
// });

// app.get("/petition/signers", (req, res) => {
//     if (req.session.signatureId) {
//         // (req.cookies.authenticated)
//         db.getSignatures()
//             .then(({ rows }) => {
//                 // results or directly {{rows}}
//                 console.log("results from getSignatures:", rows); // results.rows or directly rows
//                 res.render("signers", {
//                     rows,
//                 });
//             })
//             .catch((err) => {
//                 console.log("err in getSignatures:", err);
//             });
//     } else {
//         res.redirect("/petition");
//     }
// });

app.listen(process.env.PORT || 8080, () =>
    console.log("petition server is listening...")
);
