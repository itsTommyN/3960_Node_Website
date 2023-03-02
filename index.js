require('./utils');

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const saltRounds = 12;

// Connecting to a MySQL database
const database = include('databaseConnection');
const db_utils = include('database/db_utils');
const db_users = include('database/users');
const db_todos = include('database/todos')
const success = db_utils.printMySQLVersion();

const port = process.env.PORT || 3000;

const app = express();

const expireTime = 24 * 60 * 60 * 1000;

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));


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
    res.render("index");
});

// route to Signup
app.get('/signup', (req, res) => {
    var missingEmail = req.query.emailmia;
    var missingPass = req.query.passwordmia;
    var missingUser = req.query.usernamemia;

    res.render("signup", { missingUser: missingUser, missingEmail: missingEmail, missingPass: missingPass });
});

app.post('/submitUser', async(req, res) => {
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

        // Create the tables if not exist
        const create_tables = include('database/create_tables');

        var success_table = create_tables.createTables();

        if (success_table) {
            var success = await db_users.createUser({ user: username, email: email, hashedPassword: hashedPassword });

            if (success) {
                res.redirect('/login')
            } else {
                res.render("errorMessage", { error: "Failed to create user." });
            }
        } else {
            console.log("Error Table")
        }
    }
});

// route to Login
app.get('/login', (req, res) => {
    var missingEmail = req.query.emailmia;
    var missingPass = req.query.passwordmia;
    var missingAccount = req.query.accountmia;

    res.render("login", { missingEmail: missingEmail, missingPass: missingPass, missingAccount: missingAccount });
});

app.post('/loggingin', async (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    if (!email && !password) {
        res.redirect('/login?emailmia=1&passwordmia=1');
    } else if (!email) {
        res.redirect('/login?emailmia=1');
    } else if (!password) {
        res.redirect(`/login?passwordmia=1`);
    } else {
        var results = await db_users.getUsers({ email: email, hashedPassword: password });

        if (results) {
            if (results.length == 1) { //there should only be 1 user in the db that matches
                if (bcrypt.compareSync(password, results[0].password)) {
                    req.session.authenticated = true;
                    req.session.username = results[0].username;
                    req.session.email = email;
                    req.session.hashPW = password;
                    req.session.cookie.maxAge = expireTime;

                    res.redirect('/members');
                    return;
                } else {
                    res.redirect(`/login?accountmia=1`);
                }
            } else {
                console.log('invalid number of users matched: ' + results.length + " (expected 1).");
                res.redirect('/login');
                return;
            }
        }
        //user and password combination not found
        res.redirect("/login");
    }
});

app.get('/members', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
    }
    var images = [
        'goodone.jpg',
        'ohho.jpg',
        'thegoodhandshake.jpg'
    ]

    // Get the user's information from the database
    var results = await db_users.getUsers({ email: req.session.email, hashedPassword: req.session.hashPW });
    // Grab the primary key of this user
    var pK = results[0].user_id
    var TODO = await db_todos.getTODOS({ primary: pK });

    const randomIndex = Math.floor(Math.random() * images.length);
    res.render("members", { email: req.session.username, image: images[randomIndex], list: TODO });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

app.get('/createTables', async(req, res) => {

    const create_tables = include('database/create_tables');

    var success = create_tables.createTables();
    if (success) {
        res.render("successMessage", { message: "Created tables." });
    } else {
        res.render("errorMessage", { error: "Failed to create tables." });
    }
});

app.post('/addTodo', async (req, res) => {
    var description = req.body.todo;
    // Get the user's information from the database
    var results = await db_users.getUsers({ email: req.session.email, hashedPassword: req.session.hashPW });
    // Grab the primary key of this user
    var pK = results[0].user_id

    console.log("The thing: " + description)

    // Create the tables if not exist
    const create_tables = include('database/create_tables');

    var success_table = create_tables.createTables();

    if (success_table) {
        var success = await db_todos.createTODO({ descript: description, primary: pK})
        if (success) {
            res.redirect('/members')
        } else {
            res.render("errorMessage", { error: "Failed to create TODO." });
        }
    } else {
        console.log("Error Table")
    }

});

app.use(express.static(__dirname + "/public"))

app.get("*", (req, res) => {
    res.status(404);
    res.render("404");
})

app.listen(port, () => {
    console.log("Node application listening on port " + port);
});