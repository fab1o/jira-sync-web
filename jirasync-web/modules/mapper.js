"use strict";

var Enumerable = require("linq");
var jira = require("./jira");
var Q = require("q");

var util = require("./util");

var csv = require("csv");

function writetoCSV(data){

    csv.stringify(data, {
        header: true,
        rowDelimiter: "windows"
    }, function (err, data) {
        
        csv.parse(data, {
            columns : true
        }, function (err, data) {
            
            process.stdout.write(data);
        });

    }); 

};


exports.priorities = function (req) {
    
    var output = {
        id: 1,
        title: "Priority",
        items: []
    }


    jira
    .createJira(req, "from")
    .listPriorities(function (errorFrom, successFrom) {

        if (errorFrom == null) {
            
            var prioritiesFrom = util.deleteProperties(successFrom, ["self", "description", "iconUrl", "statusColor"]);

            jira
            .createJira(req, "to")
            .listPriorities(function (errorTo, prioritiesTo) {
                
                if (errorTo == null) {

                    output.items = prioritiesFrom;

                }

            });

        }

    });
    
};

exports.map = function (req) {
    
    var defer = Q.defer();
    
    var map = {
        
        projectFromKey: req.projectFrom.key,
        projectToKey: req.projectTo.key,

        lists: []

    };
    
    this.priorities(req)
    .then(function (priorities) {
        
        map.lists.push(priorities);
        
        defer.resolve(map);

    });
    
    return defer.promise;
};