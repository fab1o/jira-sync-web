"use strict";

var assemblyInfo = require("../modules/assemblyInfo");

exports.index = function (req, res) {

    res.render("index", {
        isAlmostLoggedIn: req.isAlmostLoggedIn,
        isLoggedIn: req.isLoggedIn,
        title: "Jira Sync",

        assemblyInfo: assemblyInfo
    });
};

exports.about = function (req, res) {

    res.render("about", {
        isAlmostLoggedIn: req.isAlmostLoggedIn,
        isLoggedIn: req.isLoggedIn,
        title: "About",
        
        assemblyInfo: assemblyInfo,

        message: "Jira Sync"
    });
};

exports.login = function (req, res) {
    
    var title = "Login";
    var message = "";
    
    if (req.login) {

        if (req.isLoggedIn) {
            title = "Logged In";
            message = "";
        }
        else {
            message = "Please login on any unlogged jira before we start";
        }
    }
    else {
        message = "Please login on both jiras before we start";
    }
    
    res.render("login", {
        redirectUrl: req.query.redirectUrl,
        isAlmostLoggedIn: req.isAlmostLoggedIn,
        isLoggedIn: req.isLoggedIn,
        title: title,
    
        assemblyInfo: assemblyInfo,

        message: message,
        error: false,
        login: req.login || {}
    });

};

exports.switch = function (req, res) {
    
    var loginTemp = req.login.to;
    
    req.login.to = req.login.from;
    req.login.from = loginTemp;    
    
    var projectTemp = req.projectFrom;

    req.projectFrom = req.projectTo;
    req.projectTo = projectTemp;

    res.redirect("/sync/" + req.params.keyTo + "/" + req.params.keyFrom);

};