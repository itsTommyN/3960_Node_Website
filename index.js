require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const saltRounds = 12;

const port = process.env.PORT || 3000;

const app = express();

const expireTime = 24 * 60 * 60 * 1000;

app.use(express.urlencoded({ extended: false }));

// In Memory 'Database'
var users = [];

/* secret information section */
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;
/* END secret section */

var mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@cluster0.dq3nbpy.mongodb.net/sessions`,
    crypto: {
        secret: mongodb_session_secret
    }
})

app.use(session({
    secret: node_session_secret,
    store: mongoStore, //default is memory store 
    saveUninitialized: false,
    resave: true
}));

// Main Menu
app.get('/', (req, res) => {
    var html = `
    <form action='/signup' method='get'>
        <button>Sign up</button>
    </form>
    <form action='/login' method='get'>
        <button>Log in</button>
    </form>
    `;
    res.send(html);
});

// route to Signup
app.get('/signup', (req, res) => {
    var missingEmail = req.query.emailmia;
    var missingPass = req.query.passwordmia;
    var missingUser = req.query.usernamemia;

    var html = `
    <form action='/submitUser' method='post'>
    <input name='username' type='text' placeholder='username'>
    <input name='email' type='email' placeholder='email'>
    <input name='password' type='password' placeholder='password'>
      <button>Submit</button>
    </form>
  `;
    if (missingUser) {
        html += "<br> Please provide a Username."
    } else if (missingEmail) {
        html += "<br> Please provide an Email Address."
    } else if (missingPass) {
        html += "<br> Please provide a Password."
    }

    res.send(html);
});

app.post('/submitUser', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    if (!email) {
        res.redirect('/signup?emailmia=1');
    } else if (!password) {
        res.redirect(`/signup?passwordmia=1`);
    } else if (!username) {
        return res.redirect(`/signup?usernamemia=1`)
    } else {
        var hashedPassword = bcrypt.hashSync(password, saltRounds);

        users.push({ username: username, email: email, password: hashedPassword });


        res.redirect('/login')
    }
});

// route to Login
app.get('/login', (req, res) => {
    var missingEmail = req.query.emailmia;
    var missingPass = req.query.passwordmia;

    var html =
        `log in
    <form action='/loggingin' method='post'>
        <input name='email' type='email' placeholder='email'>
        <input name='password' type='password' placeholder='password'>
        <button>Submit</button>
    </form>
    `
    if (missingEmail && missingPass) {
        html += "<br> Email and Password not found."
    } else if (missingEmail) {
        html += "<br> Email not found."
    } else if (missingPass) {
        html += "<br> Password not found."
    }
    res.send(html);
});

app.post('/loggingin', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    if (!email && !password) {
        res.redirect('/login?emailmia=1&passwordmia=1');
    } else if (!email) {
        res.redirect('/login?emailmia=1');
    } else if (!password) {
        res.redirect(`/login?passwordmia=1`);
    } else {
        for (i = 0; i < users.length; i++) {
            if (users[i].email == email) {
                if (bcrypt.compareSync(password, users[i].password)) {
                    req.session.authenticated = true;
                    req.session.email = email;
                    req.session.cookie.maxAge = expireTime;

                    res.redirect('/members');
                    return;
                }
            }
        }
        //user and password combination not found
        res.redirect("/login");
    }
});

app.get('/members', (req, res) => {
    if (!req.session.authenticated) {
        console.log("Hello")
        res.redirect('/login');
    }
    var images = [
        'goodone.jpg',
        'ohho.jpg',
        'thegoodhandshake.jpg'
    ]

    const randomIndex = Math.floor(Math.random() * images.length);
    var html = `
    <h1>Hello ` + req.session.email + `</hi>
    ` + `<br><img src="` + images[randomIndex] + `"/>
    <form action='/' method='get'>
        <button>Sign out</button>
    </form>`;
    res.send(html);
});

app.use(express.static(__dirname + "/public"))

app.get("*", (req, res) => {
    res.status(404);
    res.send("Page not found - 404");
})

app.listen(port, () => {
    console.log("Node application listening on port " + port);
});