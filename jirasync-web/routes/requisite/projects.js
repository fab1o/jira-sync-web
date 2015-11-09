"use strict";

var jira = require("../../modules/jira");

module.exports = exports = function (req, res, next) {
    
    jira
    .getProjectInfo(req.params.keyFrom, req, "from", true)
    .then(function (projectFrom) {
        
        projectFrom.host = req.login.from.host;
        req.projectFrom = projectFrom;
        
        jira
        .getProjectInfo(req.params.keyTo, req, "to", true)
        .then(function (projectTo) {
            
            projectTo.host = req.login.to.host;
            req.projectTo = projectTo;
            
            next();

        })
        .catch(function () { //project of 'to' doesn't exist, open 'to' list again
            
            jira
            .createJira(req, "to")
            .listProjects(function (error, projects) {
                
                res.render("sync/step2", jira.syncListResponseObj(req, "to", projects, true));

            });

        });

    })
    .catch(function () { //project of 'from' doesn't exist, open 'from' list again
        
        jira
        .createJira(req, "from")
        .listProjects(function (error, projects) {
            
            res.render("sync/step1", jira.syncListResponseObj(req, "from", projects, true));

        });

    });
};