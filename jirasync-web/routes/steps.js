"use strict";

var assemblyInfo = require("../modules/assemblyInfo");
var Enumerable = require("linq");
var jira = require("../modules/jira");
var diff = require("../modules/diff");
var mapper = require("../modules/mapper");

exports.step1 = function (req, res) {
    
    jira
    .createJira(req, "from")
    .listProjects(function (error, projects) {
        
        projects = Enumerable.from(projects).orderBy("$.key").toArray();
        
        res.render("sync/step1", jira.syncListResponseObj(req, "from", projects));
    
    });

};

exports.step2 = function (req, res) {
    
    jira
    .createJira(req, "to")
    .listProjects(function (error, projects) {
        
        projects = Enumerable.from(projects).orderBy("$.key").toArray();
        
        res.render("sync/step2", jira.syncListResponseObj(req, "to", projects));

    });

};

exports.step3 = function (req, res) {
    
    mapper.map(req)
    .then(function (map) {
        
        diff.difference(req)
        .then(function (diff) {
            
            res.render("sync/step3", {
                
                title: "Step 3",
                
                projectFrom: req.projectFrom,
                projectTo: req.projectTo,
                
                diff: diff,
                
                map: map,
                
                keyFrom: req.params.keyFrom,
                keyTo: req.params.keyTo,
                
                isAlmostLoggedIn: req.isAlmostLoggedIn,
                isLoggedIn: req.isLoggedIn,
                
                hostFrom: req.login.from.host,
                hostTo: req.login.to.host,
                
                assemblyInfo: assemblyInfo
            });

        });

    });

};