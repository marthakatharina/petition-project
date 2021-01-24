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

app.use(csurf());

app.use(function (req, res, next) {
    // this type of middleware runs for every route
    res.set("x-frame-options", "DENY"); // or "SAMEORGIN"
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(express.static("./public"));

const requireLoggedOutUser = (req, res, next) => {
    if (req.session.userId) {
        res.redirect("/petition");
    } else {
        next();
    }
};

const requireLoggedInUser = (req, res, next) => {
    if (!req.session.userId && req.url != "/register" && req.url != "/login") {
        res.redirect("/register");
    } else {
        next();
    }
};

app.get("/", requireLoggedOutUser, (req, res) => {
    if (!req.session.userId) {
        // (!req.cookies.authenticated)
        res.redirect("/register");
    } else {
        res.redirect("/login");
        console.log("already registered / redirected to login");
    }
});

app.get("/register", requireLoggedOutUser, (req, res) => {
    res.render("register", {
        layouts: "main",
    });
});

app.post(
    "/register",
    requireLoggedOutUser,

    (req, res) => {
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
                } else {
                    res.render("register", {
                        errorMessage:
                            "An account with this email already exists.",
                    });
                }
            });
        } else if (!firstname || !lastname || !email || !password) {
            console.log("redirected");
            res.render("register", {
                errorMessage: "Something went wrong. Please try again!",
            });
        }
    }
);

app.get("/login", requireLoggedOutUser, (req, res) => {
    // if (req.session.userId) {
    res.render("login", {
        layouts: "main",
    });
    // } else {
    //     res.redirect("/register");
    //     console.log("not registered / redirected to register");
    // }
});

app.post("/login", requireLoggedOutUser, (req, res) => {
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
                        errorMessage: "Invalid email or password!",
                    });
                }
            })
            .catch((err) => {
                console.log("err in getting users cookies at userInfo:", err);
            });
    } else if (!email || !password) {
        res.render("login", {
            errorMessage: "Something went wrong. Please try again!",
        });
    }
});

app.get("/petition", requireLoggedInUser, (req, res) => {
    console.log("req.session: ", req.session);
    const { id } = req.session.userId;

    if (req.session.userId.signatureId) {
        res.redirect("/petition/thanks");
    } else {
        db.checkIfSigned(id)
            .then(({ rows }) => {
                console.log("results from checkIfSigned:", rows);
                if (rows.length === 0) {
                    res.render("petition", {
                        layouts: "main",
                        // profile,
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

app.post("/petition", requireLoggedInUser, (req, res) => {
    const { signature } = req.body;
    const { id } = req.session.userId;

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
            errorMessage:
                "Touchscreen not supported. Please try again on your desktop!",
        });
    }
});

app.get(
    "/petition/thanks",
    requireLoggedInUser,

    (req, res) => {
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
                        });
                    })
                    .catch((err) => {
                        console.log("err in countSignatures:", err);
                    });
            });
        } else {
            res.redirect("/petition");
        }
    }
);

app.get(
    "/petition/signers",
    requireLoggedInUser,

    (req, res) => {
        if (req.session.userId.signatureId) {
            // (req.cookies.authenticated)
            db.getSignatures()
                .then(({ rows }) => {
                    // results or directly {{rows}}
                    console.log("results from getSignatures:", rows); // results.rows or directly rows
                    res.render("signers", {
                        rows,
                    });
                })
                .catch((err) => {
                    console.log("err in getSignatures:", err);
                });
        } else {
            res.redirect("/petition");
        }
    }
);

app.get(
    "/petition/signers/:city",
    requireLoggedInUser,

    (req, res) => {
        const { city } = req.params;

        if (req.session.userId.signatureId) {
            if (!city) {
                res.sendStatus(404);
            } else {
                db.getSignersByCity(city)
                    .then(({ rows }) => {
                        console.log("results from getSignersByCity:", rows);

                        res.render("city", {
                            layout: "main",
                            rows,
                        });
                    })
                    .catch((err) => {
                        console.log("err in getSignersByCity:", err);
                    });
            }
        }
    }
);

app.get("/profile", requireLoggedInUser, (req, res) => {
    // or requireLoggedInUser
    if (!req.session.userId.signatureId && !req.session.userId.profile) {
        // if (req.session.userId) {
        res.render("profile", {
            layouts: "main",
        });
        // } else {
        //     res.redirect("/register");
        // }
    } else {
        console.log("redirected / profile/edit");
        res.redirect("/profile/edit");
    }
});

app.post("/profile", requireLoggedInUser, (req, res) => {
    const { age, city, url } = req.body;
    const { id } = req.session.userId; // {id} relates to req.session.userId defined in register route. It is ES6 for req.session.userId.id.

    console.log("POST request made to the / profile route");

    if (age || city || url) {
        db.additionalInfo(age, city, url, id)
            .then(({ rows }) => {
                req.session.userId.profile = rows[0].id;
                console.log("rows: ", rows);
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("err in additionalInfo:", err);
            });
    } else {
        console.log("redirected, skipped profile");
        res.redirect("/petition");
    }
});

app.get(
    "/profile/edit",
    requireLoggedInUser,

    (req, res) => {
        const { id } = req.session.userId;
        if (req.session.userId) {
            db.letEdit(id)
                .then(({ rows }) => {
                    console.log("results from letEdit:", rows);
                    req.session.userId.userEmail = rows[0].email;

                    res.render("edit", {
                        layout: "main",

                        rows,
                    });
                })
                .catch((err) => {
                    console.log("err in letEdit:", err);
                });
        } else {
            res.redirect("/register");
        }
    }
);

app.post("/profile/edit", requireLoggedInUser, (req, res) => {
    const { firstname, lastname, email, password, age, city, url } = req.body;
    const { id } = req.session.userId;

    if (firstname != "" && lastname != "" && email != "") {
        // if (password == "") {
        db.userInfo(email)
            .then(({ rows }) => {
                console.log("rows: ", rows);
                if (
                    rows.length === 0 ||
                    req.session.userId.userEmail === rows[0].email
                ) {
                    if (password == "") {
                        db.updateNoPw(firstname, lastname, email, id)
                            .then(({ rows }) => {
                                console.log("rows: ", rows);
                                res.redirect("/petition");
                            })
                            .catch((err) => {
                                console.log("err in updateNoPw:", err);
                            });
                    } else if (password != "") {
                        bcrypt
                            .hash(password)
                            .then((hash) => {
                                console.log("hashedPw in profile/edit:", hash);
                                db.updatePassword(hash, id);
                            })
                            .catch((err) => {
                                console.log("err in hash password:", err);
                            });
                        db.updateWithPW(
                            firstname,
                            lastname,
                            email,
                            password,
                            id
                        )
                            .then(({ rows }) => {
                                console.log("rows: ", rows);
                                res.redirect("/petition");
                            })
                            .catch((err) => {
                                console.log("err in updateWithPw:", err);
                            });
                    }

                    db.upsertInfo(age, city, url, id)
                        .then(({ rows }) => {
                            console.log("rows: ", rows);
                            res.redirect("/petition");
                        })
                        .catch((err) => {
                            console.log("err in upsertInfo:", err);
                        });
                } else {
                    res.render("edit", {
                        layout: "main",
                        errorMessage:
                            "Sorry, this email is already taken by another user.",
                    });
                }
            })
            .catch((err) => {
                console.log("err in userInfo email already in db:", err);
            });
    } else {
        res.render("edit", {
            layout: "main",
            errorMessage: "First Name, Last Name and Email are required!",
        });
    }
});

app.post("/delete/signature", requireLoggedInUser, (req, res) => {
    const { id } = req.session.userId;
    db.deleteSignature(id)
        .then(() => {
            req.session.userId.signatureId = null;
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("error in deleteSignature", err);
        });
});

app.get("/logout", (req, res) => {
    req.session.userId = null;
    res.redirect("/login");
});

app.listen(process.env.PORT || 8080, () =>
    console.log("petition server is listening...")
);
