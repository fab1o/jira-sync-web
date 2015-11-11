"use strict";

var Enumerable = require("linq");
var jira = require("../../modules/jira");
var util = require("../../modules/util");
var diff = require("../../modules/diff");
var sync = require("../../modules/sync");
var Q = require ("q");

exports.project = function (req, res, next) {
    
    diff.difference(req)
    .then(function (diff) {
        
        if (diff.isSynced) {
            res.status(200).send("Sync was not executed. Projects are already in sync.");
        }
        
        var promises = [];
        
        promises.push(sync.componentsAditions(req, diff));
        promises.push(sync.componentsDeletions(req, diff));
        
        promises.push(sync.versionsAditions(req, diff));
        promises.push(sync.versionsDeletions(req, diff));
        
        Q.all(promises)
        .then(function () {
            
            res.status(200).send("Sync was executed. Projects are in sync.");

        })
        .catch(function () {
            
            res.send(400);

        });

    });

};

exports.component = function (req, res) {
    
    if (req.body.id == null || req.body.keyOrName == null) {
        res.send(400);
        return;
    }
    
    var LINK = "https://{0}/secure/IssueNavigator.jspa?jqlQuery=project+%3D+{1}+AND+component+%3D+\"{2}\"";

    var componentFrom = Enumerable.from(req.projectFrom.components).firstOrDefault("$.name == \"" + req.body.keyOrName + "\"", null);
    var componentTo = Enumerable.from(req.projectTo.components).firstOrDefault("$.name == \"" + req.body.keyOrName + "\"", null);
    
    if (componentTo != null && componentFrom == null) {
        
        jira
        .createJira(req, "to")
        .deleteComponent(componentTo.id, function (error, success) { //delete
            
            if (error == null) {
                res.status(204).send(success);
            } else {
                res.status(400).send(error);
            }

        });

    }else if (componentTo == null && componentFrom != null) { //add
        
        jira
        .addComponent(componentFrom, req.params.keyTo, req.projectTo.id, req)
        .then(function (newItem) {
            
            var link = LINK.format(req.projectTo.host, req.params.keyTo, encodeURIComponent(newItem.name));
            
            newItem.link = "<a href='" + link + "' target='_blank'><span>" + newItem.id + "</span></a>";
            
            res.status(201).send(newItem);

        })
        .catch(function (error) {
            
            res.status(400).send(error);
        });
    
    } else {
        res.send(208);
    }
    
};

exports.version = function (req, res) {
    
    if (req.body.id == null || req.body.keyOrName == null) {
        res.send(400);
        return;
    }
    
    var versionFrom = Enumerable.from(req.projectFrom.versions).firstOrDefault("$.name == \"" + req.body.keyOrName + "\"", null);
    var versionTo = Enumerable.from(req.projectTo.versions).firstOrDefault("$.name == \"" + req.body.keyOrName + "\"", null);
    
    if (versionTo != null && versionFrom == null) {
        
        jira
        .createJira(req, "to")
        .deleteVersion(versionTo.id, function (error, success) { //delete
            
            if (error == null) {
                res.status(204).send(success);
            } else {
                res.status(400).send(error);
            }

        });

    } else if (versionTo == null && versionFrom != null) { //add
        
        //versionFrom.name = "2.0";
                
        jira
        .addVersion(versionFrom, req.params.keyTo, req.projectTo.id, req)
        .then(function (newItem) {
            
            res.status(201).send(newItem);
        })
        .catch(function (error) {
            
            res.status(400).send(error);
        });
    
    } else {
        res.send(208);
    }
    
};

exports.issue = function (req, res) {
    
    if (req.body.id == null || req.body.keyOrName == null) {
        res.send(400);
        return;
    }

    var LINK = "https://{0}/browse/{1}";
    
    var regularFields = ["assignee", "status", "priority", "labels", "creator", "reporter", "issuetype", "created", "updated", "description", "summary", "resolution", "components", "subtasks", "resolutiondate", "fixVersions"];
    var customFields = ["customfield_10007", "customfield_10008", "customfield_10101"];
    
    var allFields = regularFields.concat(customFields);
    
    jira
    .createJira(req, "from")
    .findIssueWithFields(req.body.keyOrName, allFields, function (errorFrom, issueFrom) {
        
        if (errorFrom) {
            res.status(400).send(errorFrom);
            return;
        }
        
        jira
        .createJira(req, "to")
        .findIssueWithFields(req.body.keyOrName, allFields, function (errorTo, issueTo) {
            
            if (errorTo) {
                res.status(400).send(errorTo);
                return;
            }
            
            if (issueTo != null && issueFrom == null) { //delete
                
                jira
                .createJira(req, "to")
                .deleteIssue(issueTo.id, function (error, success) {
                    
                    if (error == null) {
                        res.status(204).send(success);
                    } else {
                        res.status(400).send(error);
                    }

                });

            } else if (issueTo == null && issueFrom != null) { //add
                
                issueTo = util.cloneIssue(issueFrom, regularFields);
                
                addCustomField(issueFrom, customFields, req)
                .then(function (customFields) {
                    
                    for (var i in customFields) {
                        
                        issueTo.fields[i] = customFields[i];
                    }

                    addIssueType(issueTo, req)
                    .then(function (issueTypeTo) {
                        
                        issueTo.fields.issuetype = issueTypeTo;
                        
                        jira
                        .addIssue(issueTo, req.projectTo.id, req)
                        .then(function (newItem) {
                            
                            var link = LINK.format(req.projectTo.host, newItem.key);
                            
                            newItem.link = "<a href='" + link + "' target='_blank'><span>" + newItem.id + "</span></a>";
                            
                            res.status(201).send(newItem);

                        });
                                                
                    })

                })
                .catch(function (error) {
                    
                    res.status(400).send(error);
                });
    
            } else {

                res.send(208);
            }
        
        });

    });
    
};

function addIssueType(issueFrom, req) {
    
    var defer = Q.defer();

    var issueTypeFrom = issueFrom.fields.issuetype;
    
    if (issueTypeFrom == null) {
        defer.reject("issueTypeFrom could not be retrieved");
        return defer.promise;
    }
    
    jira
    .createJira(req, "to")
    .listIssueTypes(function (errorIssueTypesTo, successIssueTypesTo) {
        
        var issueTypeTo = null;

        if (errorIssueTypesTo == null) {
            issueTypeTo = Enumerable.from(successIssueTypesTo).firstOrDefault("$.name == \"" + issueTypeFrom.name + "\"", null);
        }
        
        if (issueTypeTo == null) { //add
            jira
            .addIssueType(issueTypeFrom, req)
            .then(function (newIssueTypeTo) {
                
                issueTypeTo = newIssueTypeTo;
                defer.resolve(newIssueTypeTo);
            })
            .catch(function (error) {

                defer.reject(error);

            });
        } else {            
            defer.resolve(issueTypeTo);
        }

    });
    
    return defer.promise;
};

function addCustomField(issueFrom, customFieldsFrom, req) {
    
    var defer = Q.defer();

    if (customFieldsFrom == null || !Array.isArray(customFieldsFrom)) {
        defer.reject("issueTypeFrom could not be retrieved");
        return defer.promise;
    }
    
    var fields = [];
    
    jira
    .createJira(req, "from")
    .listFields(function (errorFieldsFrom, successFieldsFrom) {
        
        if (errorFieldsFrom == null) {

            jira
            .createJira(req, "to")
            .listFields(function (errorFieldsTo, successFieldsTo) {
                
                if (errorFieldsTo == null) {
                    
                    var counter = 0;
                    
                    var promises = [];

                    for (var i in customFieldsFrom) {
                        
                        var fieldFrom = Enumerable.from(successFieldsFrom).firstOrDefault("$.id == \"" + customFieldsFrom[i] + "\"", null);
                        
                        if (fieldFrom == null || issueFrom.fields[customFieldsFrom[i]] == null) {
                            counter++;
                            continue;
                        }
                        
                        var fieldTo = Enumerable.from(successFieldsTo).firstOrDefault("$.name == \"" + fieldFrom.name + "\"", null);
                        
                        if (fieldTo == null) { //add
                            
                            promises.push(jira.addCustomField(fieldFrom, req));

                        } else { //found a match
                            
                            counter++;
                            
                            fields[fieldTo.id] = issueFrom.fields[customFieldsFrom[i]];

                            if (customFieldsFrom.length == counter) {
                                defer.resolve(fields);
                            }
                        }
                    }

                    Q.all(promises)
                    .then(function (success) {
                        
                        counter++;
                        
                        fields[newCustomFieldTo.id] = issueFrom.fields[customFieldsFrom[i]];
                        
                        if (customFieldsFrom.length == counter) {
                            defer.resolve(fields);
                        }

                    })
                    .catch(function (error) {
                        
                        counter++;
                        
                        defer.reject(error);

                    });

                } else {
                    defer.reject();
                }

            });

        } else {
            defer.reject();
        }
        
    });
    
    return defer.promise;
};