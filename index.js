require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const saltRounds = 12;

const port = process.env.PORT || 3000;

const app = express();

// const expireTime = 24 * 60 * 60 * 1000;

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
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}cluster0.dq3nbpy.mongodb.net/sessions`,
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
    <form action='/signup' method='post'>
        <button>Sign up</button>
    </form>
    <form action='/login' method='post'>
        <button>Log in</button>
    </form>
    `;
    res.send(html);
});

// route to Signup
app.post('/signup', (req, res) => {
    var missingEmail = req.query.missing;

    var html = `
    <form action='/submitUser' method='post'>
      <input name='email' type='text' placeholder='email'>
      <button>Submit</button>
    </form>
  `;

    if (missingEmail) {
        html += "email is required"
    }

    res.send(html);
});

app.post('/submitUser', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    if (!email) {
        res.redirect('/signup?missing=1');
    } else if (!password) {
        res.redirect(`/signup?error=Invalid Password`);
    } else if (!username) {
        return res.redirect(`/signup?error=Invalid Username`)
    } else {
        var hashedPassword = bcrypt.hashSync(password, saltRounds);

        users.push({ username: username, password: hashedPassword });


        res.redirect('/login')
    }
});

// route to Login
app.post('/login', (req, res) => {
    var username = req.body.username
    var html =
        `log in
    <form action='/members' method='post'>
        <input name='email' type='email' placeholder='email'>
        <input name='password' type='password' placeholder='password'>
        <button>Submit</button>
    </form>
    `
    res.send(html);
});

app.post('/loggingin', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;


    var usershtml = "";
    for (i = 0; i < users.length; i++) {
        if (users[i].username == username) {
            if (bcrypt.compareSync(password, users[i].password)) {
                req.session.authenticated = true;
                req.session.username = username;
                req.session.cookie.maxAge = expireTime;

                res.redirect('/members');
                return;
            }
        }
    }

    //user and password combination not found
    res.redirect("/login");
});

app.get('/members', (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
    }
    var html = `
    <h1>Hi</hi>
    `;
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