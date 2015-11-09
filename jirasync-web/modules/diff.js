"use strict";

var Enumerable = require("linq");
var jira = require("./jira");
var Q = require("q");

exports.components = function (req) {
    
    var output = {
        id: 1,
        title: "Component", //this name has to match the router rule for "/api/sync/:keyFrom/:keyTo/Component/:id"
        items: [],
        addCount: 0,
        removeCount: 0,
        syncedCount: 0,
        total: 0
    }
    
    var LINK = "https://{0}/secure/IssueNavigator.jspa?jqlQuery=project+%3D+{1}+AND+component+%3D+\"{2}\"";
    
    var componentsFrom = Enumerable.from(req.projectFrom.components);
    var componentsTo = Enumerable.from(req.projectTo.components);
    
    var componentsFromSize = req.projectFrom.components.length;
    var componentsToSize = req.projectTo.components.length;
    
    for (var i = 0; i < componentsFromSize; i++) {
        
        //get all components 'from' and check if they exists on components 'to' for adition
        var componentFrom = componentsFrom.elementAt(i);
        
        componentFrom.linkFrom = LINK.format(req.projectFrom.host, req.projectFrom.key, encodeURIComponent(componentFrom.name));
        componentFrom.linkTo = LINK.format(req.projectTo.host, req.projectTo.key, encodeURIComponent(componentFrom.name));
        componentFrom.idFrom = componentFrom.id;
        
        var componentTo = componentsTo.firstOrDefault("$.name == \"" + componentFrom.name + "\"", null);
        
        if (componentTo != null) { //if yes, add component 'to' to the diff list
            
            componentTo.class = "success";
            
            componentTo.idFrom = componentFrom.id;
            componentTo.idTo = componentTo.id;
            componentTo.linkFrom = LINK.format(req.projectFrom.host, req.projectFrom.key, encodeURIComponent(componentTo.name));
            componentTo.linkTo = LINK.format(req.projectTo.host, req.projectTo.key, encodeURIComponent(componentTo.name));
            
            componentTo.isSynced = true;
            
            output.syncedCount++;
            
            output.items.push(componentTo);

        } else { //if no, add component 'from' to the diff list as a new item
            
            componentFrom.isNew = true;
            componentFrom.isSynced = false;
            componentFrom.class = "info";
            
            output.addCount++;
            
            output.items.push(componentFrom);
        }

    }
    
    for (var j = 0; j < componentsToSize; j++) {
        
        //now get all components 'to' and check if they exists on components 'from' for deletion
        componentTo = componentsTo.elementAt(j);
        componentFrom = componentsFrom.firstOrDefault("$.name == \"" + componentTo.name + "\"", null);
        
        if (componentFrom == null) { //if no, add component 'to' and mark for deletion
            
            componentTo.isRemoved = true;
            componentTo.class = "danger";
            
            componentTo.idTo = componentTo.id;
            componentTo.linkTo = LINK.format(req.projectTo.host, req.projectTo.key, encodeURIComponent(componentTo.name));
            
            componentTo.isSynced = false;
            
            output.removeCount++;
            
            output.items.push(componentTo);
        }
        //if yes, do nothing

    }
    
    output.total = output.items.length;
    
    return output;
};

exports.versions = function (req) {
    
    var output = {
        id: 2,
        title: "Version", //this name has to match the router rule for "/api/sync/:keyFrom/:keyTo/Version/:id"
        items: [],
        addCount: 0,
        removeCount: 0,
        syncedCount: 0,
        total: 0
    }
    
    var versionsFrom = Enumerable.from(req.projectFrom.versions);
    var versionsTo = Enumerable.from(req.projectTo.versions);
    
    var versionsFromSize = req.projectFrom.versions.length;
    var versionsToSize = req.projectTo.versions.length;
    
    for (var i = 0; i < versionsFromSize; i++) {
        
        //get all versions 'from' and check if they exists on versions 'to' for adition
        var versionFrom = versionsFrom.elementAt(i);
        var versionTo = versionsTo.firstOrDefault("$.name == \"" + versionFrom.name + "\"", null);
        
        if (versionTo != null) { //if yes, add version 'to' to the diff list
            
            versionTo.class = "success";
            versionTo.idFrom = versionFrom.id;
            versionTo.idTo = versionTo.id;
            versionTo.isSynced = true;
            
            output.syncedCount++;
            
            output.items.push(versionTo);

        } else { //if no, add version 'from' to the diff list as a new item
            
            versionFrom.isNew = true;
            versionFrom.class = "info";
            versionFrom.idFrom = versionFrom.id;
            versionFrom.isSynced = false;
            
            output.addCount++;
            
            output.items.push(versionFrom);
        }

    }
    
    for (var j = 0; j < versionsToSize; j++) {
        
        //now get all versions 'to' and check if they exists on versions 'from' for deletion
        versionTo = versionsTo.elementAt(j);
        versionFrom = versionsFrom.firstOrDefault("$.name == \"" + versionTo.name + "\"", null);
        
        if (versionFrom == null) { //if no, add version 'to' and mark for deletion
            
            versionTo.isRemoved = true;
            versionTo.class = "danger";
            versionTo.idTo = versionTo.id;
            versionTo.isSynced = false;
            
            output.removeCount++;
            
            output.items.push(versionTo);
        }
        //if yes, do nothing

    }
    
    output.total = output.items.length;
    
    return output;
};


exports.issueTypes = function (req) {
    
    var defer = Q.defer();
    
    var output = {
        id: 4,
        title: "IssueType", //this name has to match the router rule for "/api/sync/:keyFrom/:keyTo/IssueType/:id"
        items: [],
        addCount: 0,
        removeCount: 0,
        syncedCount: 0,
        total: 0
    }
    
    jira
    .createJira(req, "from")
    .listIssueTypes(function (errorFrom, successFrom) {
        
        var issueTypesFrom = null;
        var issueTypesFromSize = 0;
        
        if (errorFrom == null) {
            issueTypesFrom = Enumerable.from(successFrom);
            issueTypesFromSize = issueTypesFrom.count();
        }
        
        jira
        .createJira(req, "to")
        .listIssueTypes(function (errorTo, successTo) {
            
            var issueTypesTo = null;
            var issueTypesToSize = 0;
            
            if (errorTo == null) {
                issueTypesTo = Enumerable.from(successTo);
                issueTypesToSize = issueTypesTo.count();
            }
            
            for (var i = 0; i < issueTypesFromSize; i++) {
                
                //get all issueTypes 'from' and check if they exists on issueTypes 'to' for adition
                var issueTypeFrom = issueTypesFrom.elementAt(i);
                
                issueTypeFrom.idFrom = issueTypeFrom.id;
                
                var issueTypeTo = issueTypesTo.firstOrDefault("$.name == \"" + issueTypeFrom.name + "\"", null);
                
                if (issueTypeTo != null) { //if yes, add issueType 'to' to the diff list
                    
                    issueTypeTo.class = "success";
                    
                    issueTypeTo.idFrom = issueTypeFrom.id;
                    issueTypeTo.idTo = issueTypeTo.id;
                    
                    issueTypeTo.isSynced = true;
                    
                    output.syncedCount++;
                    
                    output.items.push(issueTypeTo);

                } else { //if no, add component 'from' to the diff list as a new item
                    
                    issueTypeFrom.isNew = true;
                    issueTypeFrom.isSynced = false;
                    issueTypeFrom.class = "info";
                    
                    output.addCount++;
                    
                    output.items.push(issueTypeFrom);
                }

            }
            
            for (var j = 0; j < issueTypesToSize; j++) {
                
                //now get all issueType 'to' and check if they exists on components 'from' for deletion
                issueTypeTo = issueTypesTo.elementAt(j);
                issueTypeFrom = issueTypesFrom.firstOrDefault("$.name == \"" + issueTypeTo.name + "\"", null);
                
                if (issueTypeFrom == null) { //if no, add issueType 'to' and mark for deletion
                    
                    issueTypeTo.isRemoved = true;
                    issueTypeTo.class = "danger";
                    
                    issueTypeTo.idTo = issueTypeTo.id;
                    
                    output.removeCount++;
                    
                    output.total++;
                    
                    issueTypeTo.isSynced = false;
                    
                    output.items.push(issueTypeTo);
                }
                //if yes, do nothing

            }
            
            defer.resolve(output);
        
        });

    });
    
    return defer.promise;
    
};

exports.issues = function (req) {
    
    var defer = Q.defer();
    
    var output = {
        id: 3,
        title: "Issue", //this name has to match the router rule for "/api/sync/:keyFrom/:keyTo/Issue/:id"
        items: [],
        addCount: 0,
        removeCount: 0,
        syncedCount: 0,
        total: 0,
        pagination: {
            pagesTotal: 0,
            active: 0,
            pages: []
        }
    }
    
    var requestedPage = req.query.page || 0;
    
    var ITEMS_PER_PAGE = 30;
    
    var LINK = "https://{0}/browse/{1}";
    
    var jql = "project=" + req.projectFrom.key;
    var fields = ["navigable"];
    
    jira
    .createJira(req, "from")
    .searchJira(jql, {
        
        fields: fields,
        maxResults: ITEMS_PER_PAGE

    }, function (errorFrom, successFrom) {
        
        var issuesFrom = null;
        var issuesFromSize = 0;
        
        if (errorFrom == null) {
            issuesFrom = Enumerable.from(successFrom.issues);
            issuesFromSize = issuesFrom.count();
            
            output.total = successFrom.total;
            
            if (output.total > ITEMS_PER_PAGE)
                output.pagination.pagesTotal = output.total / ITEMS_PER_PAGE;
            
            output.pagination.active = req.query.page || 0;
            
            var start = 0;
            
            if (output.pagination.active > 3)
                start = output.pagination.active - 3;
            
            for (var p = start; p <= Math.abs(6 - start); p++) {
                output.pagination.pages.push(p);
            }
        }
        
        jql = "project=" + req.projectTo.key;
        
        jira
        .createJira(req, "to")
        .searchJira(jql, {
            
            fields: fields,
            maxResults: 2000

        }, function (errorTo, successTo) {
            
            var issuesTo = null;
            var issuesToSize = 0;
            
            if (errorTo == null) {
                issuesTo = Enumerable.from(successTo.issues);
                issuesToSize = issuesTo.count();
            }
            
            for (var i = 0; i < issuesFromSize; i++) {
                
                //get all issues 'from' and check if they exists on issues 'to' for adition
                var issueFrom = issuesFrom.elementAt(i);
                
                issueFrom.linkFrom = LINK.format(req.projectFrom.host, issuesFrom.key);
                issueFrom.linkTo = LINK.format(req.projectTo.host, issuesFrom.key);
                issueFrom.idFrom = issueFrom.id;
                
                var issueTo = issuesTo.firstOrDefault("$.key == \"" + issueFrom.key + "\"", null);
                
                if (issueTo != null) { //if yes, add issue 'to' to the diff list
                    
                    issueTo.class = "success";
                    
                    issueTo.idFrom = issueFrom.id;
                    issueTo.idTo = issueTo.id;
                    issueTo.linkFrom = LINK.format(req.projectFrom.host, issueFrom.key);
                    issueTo.linkTo = LINK.format(req.projectTo.host, issueTo.key);
                    
                    issueTo.isSynced = true;
                    
                    output.syncedCount++;
                    
                    output.items.push(issueTo);

                } else { //if no, add component 'from' to the diff list as a new item
                    
                    issueFrom.isNew = true;
                    issueFrom.isSynced = false;
                    issueFrom.linkFrom = LINK.format(req.projectFrom.host, issueFrom.key);
                    issueFrom.class = "info";
                    
                    output.addCount++;
                    
                    output.items.push(issueFrom);
                }

            }
            
            for (var j = 0; j < issuesToSize; j++) {
                
                //now get all issue 'to' and check if they exists on components 'from' for deletion
                issueTo = issuesTo.elementAt(j);
                issueFrom = issuesFrom.firstOrDefault("$.key == \"" + issueTo.key + "\"", null);
                
                if (issueFrom == null) { //if no, add issue 'to' and mark for deletion
                    
                    issueTo.isRemoved = true;
                    issueTo.class = "danger";
                    
                    issueTo.idTo = issueTo.id;
                    issueTo.linkTo = LINK.format(req.projectTo.host, issueTo.key);
                    
                    output.removeCount++;
                    
                    output.total++;
                    
                    issueTo.isSynced = false;
                    
                    output.items.push(issueTo);
                }
                //if yes, do nothing

            }
            
            defer.resolve(output);
        
        });

    });
    
    return defer.promise;
    
};

exports.difference = function (req) {
    
    var defer = Q.defer();
    
    var diff = {
        isSynced: true,        
        lists: []
    };
    
    var components = this.components(req);
    var versions = this.versions(req);
    
    var issueTypes = this.issueTypes(req);
    
    diff.lists.push(components);
    diff.lists.push(versions);
    
    var self = this;

    this.issues(req)
    .then(function (issues) {
         
        diff.lists.push(issues);
        
        //self.issueTypes(req)
        //.then(function (issueTypes) {

        //    diff.lists.push(issueTypes);
            
        for (var i = 0; i < diff.lists.length; i++) {
            diff.isSynced = Enumerable.from(diff.lists[i].items).count("!$.isSynced") == 0;
            if (!diff.isSynced)
                break;
        }
            
        defer.resolve(diff);

        //});

    });
    
    return defer.promise;
};