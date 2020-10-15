const express = require("express");
const app = express();
const db = require("./db");
const cookieParser = require("cookie-parser");
const handlebars = require("express-handlebars");

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: false }));

app.use(express.static("./public"));

app.use(cookieParser());

app.get("/", (req, res) => {
    res.redirect("/petition");
    console.log("get request to / route happened");
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        layouts: "main",
    });
});

app.post("/petition", (req, res) => {
    const { firstname, lastname } = req.body;

    console.log("POST request made to the / petition route");
    if (firstname && lastname) {
        res.cookie("authenticated", true);
        res.redirect("/petition/thanks");
    } else if (!firstname || !lastname) {
        // res.send(`
        //     <h1>Oh, something went wrong. Please try again!</h1>
        // `); // render back petition page here with the above text, maybe with helpers or partials
        console.log("redirected");
        res.redirect("/petition");
    }
});

app.get("/petition/thanks", (req, res) => {
    console.log("req.cookies: ", req.cookies);
    if (req.cookies.authenticated) {
        res.render("thanks", {
            layouts: "main",
        });
    } else {
        res.redirect("/petition");
    }
});

app.get("/signatures", (req, res) => {
    db.getSignatures()
        .then((results) => {
            // or directly {{rows}}
            console.log("results from getSignatures:", results.rows); // or directly rows
        })
        .catch((err) => {
            console.log("err in getSignatures:", err);
        });
});

app.post("/add-signature", (req, res) => {
    db.addSignature("Ola Lola ", "Lolo Elo")
        .then(() => {
            // this is harcoded but should come from the user input
        })
        .catch((err) => {
            console.log("err in addSignature:", err);
        });
});

app.get("/petition/signers", (req, res) => {
    // const { signatures } = req.params;
    // const signers = db.find((item) => item.rows === signatures);
    if (req.cookies.authenticated) {
        res.render("signers", {
            layout: "main",
            // signers,
        });
    } else {
        res.redirect("/petition");
    }
});

app.listen(8080, () => console.log("petition server is listening..."));

//spice pg is a middleware packet and returns promises instead of callbacks

// hand sign should be made in canvas with event listeners mouse move, up and down in script.js image url is generated, to call it we need to create a fn called toDataUrl and set to value hidden input field (input type="hidden") store that value as the hidden input field with .val() method and then it's served to the sever, 3 input fields in total with name="" artibute will be sent to sever (one hidden) and then wrap all this in POST

// set cookies to remember that they signed otherwise they would sign again

// redirect to thank you and amount of signers

//redirect to signers page

// image pexels and unsplash
