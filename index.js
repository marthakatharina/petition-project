const express = require("express");
const app = express();
const db = require("./db");
const handlebars = require("express-handlebars");
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const csurf = require("csurf");

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
    // console.log("req.session: ", req.session);
    // req.session.pimento = "bigSecret99"; // pimento is a value we can set whatever we want (eg. id from database?)

    if (!req.session.signatureId) {
        // (!req.cookies.authenticated)
        res.redirect("/petition");
    } else {
        res.redirect("/petition/thanks");
        console.log("already signed / redirected");
    }
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        layouts: "main",
    });
});

app.get("/petition/thanks", (req, res) => {
    if (req.session.signatureId) {
        // (req.cookies.authenticated)
        db.countSignatures()
            .then(({ rows }) => {
                console.log("results from countSignatures:", rows); //
                res.render("thanks", {
                    layouts: "main",
                    rows,
                });
            })
            .catch((err) => {
                console.log("err in countSignatures:", err);
            });

        //     res.render("thanks", {
        //         layouts: "main",
        //     });
    } else {
        res.redirect("/petition");
    }
});

app.get("/petition/signers", (req, res) => {
    if (req.session.signatureId) {
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
});

app.post("/petition", (req, res) => {
    const { firstname, lastname, signature } = req.body;

    console.log("POST request made to the / petition route");

    if (firstname && lastname && signature) {
        db.addSignature(firstname, lastname, signature)
            .then(({ rows }) => {
                req.session.signatureId = rows[0].id;
                res.redirect("/petition/thanks");
            })
            .catch((err) => {
                console.log("err in addSignature:", err);
            });
        // res.cookie("authenticated", true);
    } else if (!firstname || !lastname || !signature) {
        console.log("redirected");
        res.render("petition", {
            errorMessage: "Something went wrong. Please try again!",
        });
    }
});

app.listen(8080, () => console.log("petition server is listening..."));

//spice pg is a middleware packet and returns promises instead of callbacks

// hand sign should be made in canvas with event listeners mouse move, up and down in script.js image url is generated, to call it we need to create a fn called toDataUrl and set to value hidden input field (input type="hidden") store that value as the hidden input field with .val() method and then it's served to the sever, 3 input fields in total with name="" artibute will be sent to sever (one hidden) and then wrap all this in POST

// set cookies to remember that they signed otherwise they would sign again

// redirect to thank you and amount of signers

//redirect to signers page

// image pexels and unsplash
