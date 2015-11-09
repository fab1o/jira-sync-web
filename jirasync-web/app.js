"use strict";
/**
 * Module dependencies.
 */

var express = require("express");
var assemblyInfo = require("./modules/assemblyInfo");
var requisite = {
    login: require("./routes/requisite/login"),
    project: require("./routes/requisite/project"),
    projects: require("./routes/requisite/projects")
};
var routes = require("./routes/index");
var steps = require("./routes/steps");
var api = {
    login: require("./routes/api/login"),
    avatar: require("./routes/api/avatar"),
    sync: require("./routes/api/sync"),
    requisite: {
        login: require("./routes/api/requisite/login")
    }
};
var http = require("http");
var path = require("path");
var format = require("string-format");
//var session = require("client-sessions");

var app = express();

// all environments
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(express.favicon());
app.use(express.logger("dev"));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.cookieParser("JIRASYNC"));
app.use(express.session({ secret: "jiraSyncwebjiraSyncweb" }));
//app.use(express.cookieSession({
//    key: "jirasync.web",
//    secret: "JIRASYNC"
//}));

app.use(function (req, res, next) {
    
    if (req.session && req.session.login) {
        
        req.login = req.session.login;
        
        if (req.login.to && req.login.to.success && req.login.from && req.login.from.success)
            req.isLoggedIn = true;
        else
            req.isLoggedIn = false;
        
        if ((req.login.to && req.login.to.success) || (req.login.from && req.login.from.success))
            req.isAlmostLoggedIn = true;
        else
            req.isAlmostLoggedIn = false;

        next();

    } else {
        
        req.isAlmostLoggedIn = false;
        req.isLoggedIn = false;

        next();
    }

});

app.use(app.router);
app.use(require("stylus").middleware(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));

app.locals.basedir = path.join(__dirname, 'views');

//app.use(sessions({
//    cookieName: "jiraSync", // cookie name dictates the key name added to the request object
//    secret: "jiraSyncwebjiraSyncweb", // should be a large unguessable string
//    duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
//    cookie: {
//        path: "/api", // cookie will only be sent to requests under "/api"
//        maxAge: 60000, // duration of the cookie in milliseconds, defaults to duration above
//        ephemeral: false, // when true, cookie expires when the browser closes
//        httpOnly: true, // when true, cookie is not accessible from javascript
//        secure: false // when true, cookie will only be sent over SSL. use key "secureProxy" instead if you handle SSL not in your node process
//    }
//}));

//// development only
//if ("development" == app.get("env")) {
//    app.use(express.errorHandler());
//}

app.use(function (req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
    app.use(function (err, req, res, next) {
        res.render("error", {
            message: err.message,
            error: err,
            assemblyInfo: assemblyInfo
        });
    });
}

//// production error handler
//// no stacktraces leaked to user
//app.use(function (err, req, res, next) {
//    res.render("error", {
//        message: err.message,
//        error: {}
//    });
//});

//static routes =============================================================================
app.get("/", routes.index);
app.get("/home", routes.index);
app.get("/login", routes.login);
app.get("/about", routes.about);

//switch projects ===========================================================================
app.get("/switch/:keyFrom/:keyTo", [requisite.login, requisite.projects], routes.switch);

//steps =====================================================================================
app.get("/sync/:keyFrom/:keyTo", [requisite.login, requisite.projects], steps.step3);
app.get("/sync/:keyFrom", [requisite.login, requisite.project], steps.step2);
app.get("/sync", requisite.login, steps.step1);

//api =======================================================================================
app.post("/api/login", api.login);
app.get("/api/avatar", api.avatar);

//project-level sync
app.post("/api/sync/:keyFrom/:keyTo", [requisite.login, requisite.projects], api.sync.project);

//single item sync
app.post("/api/sync/:keyFrom/:keyTo/component", [api.requisite.login, requisite.projects], api.sync.component);
app.post("/api/sync/:keyFrom/:keyTo/version", [api.requisite.login, requisite.projects], api.sync.version);
app.post("/api/sync/:keyFrom/:keyTo/issue", [api.requisite.login, requisite.projects], api.sync.issue);


app.get("/logout", function (req, res) {
    
    if (req.session.reset)
        req.session.reset();
    
    if (req.session.destroy)
        req.session.destroy();
    
    res.clearCookie("login");

    res.redirect("/home");
});

// redirect all others to the index (HTML5 history)
//app.get("*", routes.index);

http.createServer(app).listen(app.get("port"), function () {

    console.log("Express server listening on port " + app.get("port"));

});

format.extend(String.prototype);