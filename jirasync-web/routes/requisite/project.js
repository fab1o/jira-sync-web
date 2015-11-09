"use strict";

var jira = require("../../modules/jira");

module.exports = exports = function (req, res, next) {
    
    jira
    .getProjectInfo(req.params.keyFrom, req, "from")
    .then(function (projectFrom) {
        
        projectFrom.host = req.login.from.host;
        req.projectFrom = projectFrom;

        next();

    })
    .catch(function () { //project of 'from' doesn't exist, open 'from' list again
        
        jira
        .createJira(req, "from")
        .listProjects(function (error, projects) {
            
            res.render("sync/step1", jira.syncListResponseObj(req, "from", projects, true));

        });


    });

};