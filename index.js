var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var fs = require('fs');
var moment = require('moment');
var handlebars = require('express3-handlebars').create({
    defaultLayout: 'main'
});

app.use(express.static(__dirname + '/static'));
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
var options = {
    secret: 'yee',
    resave: false,
    saveUninitialized: false,
    store: new FileStore,
    cookie: {
        maxAge: 3600000,
        secure: false,
        httpOnly: true
    },
    name: 'my.connect.sid'
}
app.use(session(options));

var fileToJson = (path) => {
    return JSON.parse(fs.readFileSync(path));
}
var jsonToFile = (data, path) => {
    fs.writeFileSync(path, JSON.stringify(data, undefined, 2));
}


app.get('/notebook/:id', (req, res) => {
    var books = fileToJson('data/notebooks.json');
    for (i in books) {
        if (books[i].id == req.params.id) {
            if (books[i].owner == req.session.username) {
                var book = books[i];
            } else {
                req.send('This isn\'t your book.');
            }
        }
    }
    var args = {
        book: book,
        username: req.session.username
    };
    res.render('notebook', args);
});
app.get('/notebook/:id/create-entry', (req, res) => {
    res.render('create-entry', {
        id: req.params.id
    });
});
app.post('/notebook/:id/create-entry-process', (req, res) => {
    var books = fileToJson('data/notebooks.json');
    for (var i = 0; i < books.length; i++) {
        if (books[i].id == req.params.id) {
            if (books[i].entries[0]) {
                var id = books[i].entries.reverse()[0].id + 1;
            } else {
                var id = 0;
            }
            books[i].entries.push({
                id: id,
                title: req.body.title,
                text: req.body.text,
                entered: moment().format("MM-DD-YYYY h:mm:ss a")
            });
        }
    }
    jsonToFile(books, 'data/notebooks.json');
    res.redirect(303, '/notebook/' + req.params.id);
});

app.get('/dash', (req, res) => {
    if (req.session.username) {
        var bookArray = fileToJson('data/notebooks.json');
        var mine = [];
        for (i in bookArray) {
            if (bookArray[i].owner == req.session.username) {
                bookArray[i].created = moment(bookArray[i].created, "MM-DD-YYYY h:mm:ss a").fromNow();
                bookArray[i].entriescount = bookArray[i].entries.length
                mine.push(bookArray[i]);
            }
        }
        var args = {
            username: req.session.username,
            notebooks: mine
        };
        res.render('dash', args);
    } else {
        res.redirect(303, '/');
    }
});
app.post('/create-notebook-process', (req, res) => {
    if (req.body.name != "") {
        var bookArray = fileToJson('data/notebooks.json');
        if (bookArray[0]) {
            var id = bookArray.reverse()[0].id + 1;
        } else {
            var id = 0;
        }
        bookArray.push({
            id: id,
            name: req.body.name,
            owner: req.session.username,
            created: moment().format('MM-DD-YYYY h:mm:ss a'),
            entries: []
        });
        jsonToFile(bookArray, 'data/notebooks.json');
    }
    res.redirect(303, '/dash');
});



app.get('/', (req, res) => {
    if (req.session.username) {
        res.redirect(303, '/dash');
    }
    res.render('users/login-create', {
        login: true
    });
});
app.post('/login-process', (req, res) => {
    var userArray = fileToJson('data/users.json');
    for (i in userArray) {
        if (userArray[i].username == req.body.username) {
            if (userArray[i].password == req.body.password) {
                req.session.username = req.body.username;
                res.redirect(303, '/dash');
            } else {
                res.render('users/pass-wrong');
            }
        }
    }
});
app.get('/logout', (req, res) => {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.clearCookie(options.name);
        }
    });
    res.render('users/logout');
});

app.get('/create-user', (req, res) => {
    res.render('users/login-create', {
        login: false
    });
});
app.post('/create-user-process', (req, res) => {
    var userArray = fileToJson('data/users.json');
    userArray.push({
        username: req.body.username,
        password: req.body.password,
        created: moment().format('MM-DD-YYYY h:mm:ss a')
    });
    jsonToFile(userArray, 'data/users.json');
    req.session.username = req.body.username;
    res.redirect(303, '/dash');
});

http.listen(3000, () => {
    console.log('Started')
});
