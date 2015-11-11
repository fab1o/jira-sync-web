"use strict";

var assemblyInfo = require("./assemblyInfo");
var JiraApi = require("jira").JiraApi;
var Q = require("q");

exports.createJira = function (req, type) {
    
    return new JiraApi("https", req.login[type].host, "443", req.login[type].userName, req.login[type].userPassword, "2");
};

exports.getProjectInfo = function (key, req, type) {
    
    var defer = Q.defer();
    
    this
    .createJira(req, type)
    .getProject(key, function (error, project) {
        
        if (error) {
            defer.reject(error);
        }else {
            defer.resolve(project);
        }
            
    });
    
    return defer.promise;
};

exports.syncListResponseObj = function (req, type, projects, error) {
    
    error = error || false;
    
    return {
        title: "Step " + (type == "from" ? 1 : 2) + ": Sync " + type,
        
        error: error,
        
        host: req.login[type].host,
        displayName: req.login[type].displayName,
        
        keyTo: req.params.keyTo,
        keyFrom: req.params.keyFrom,
        
        projects: projects,
        
        isAlmostLoggedIn: req.isAlmostLoggedIn,
        isLoggedIn: req.isLoggedIn,

        assemblyInfo: assemblyInfo
    };

};



exports.addComponent = function (component, projectKey, projectId, req) {
    
    var defer = Q.defer();
    
    component.project = projectKey;
    component.projectId = parseInt(projectId);
    
    delete component.self;
    delete component.id;
    
    this
    .createJira(req, "to")
    .addNewComponent(component, function (error, newItem) {
        
        if (error == null)
            defer.resolve(newItem);
        else
            defer.reject(error);
    });
    
    return defer.promise;
};

exports.addVersion = function (version, projectKey, projectId, req) {
    
    var defer = Q.defer();
    
    version.project = projectKey;
    version.projectId = parseInt(projectId);
    
    delete version.self;
    delete version.id;
    delete version.releaseDate;
    delete version.userReleaseDate;
    delete version.startDate;
    delete version.userStartDate;
    
    this
    .createJira(req, "to")
    .createVersion(version, function (error, newItem) {
        
        if (error == null)
            defer.resolve(newItem);
        else
            defer.reject(error);

    });
    
    return defer.promise;
};

exports.addIssue = function (issue, projectId, req) {
    
    var defer = Q.defer();
    
    delete issue.self;
    delete issue.id;
    delete issue.expand;
    
    issue.fields.project = {
        id: projectId
    };
    
    this
    .createJira(req, "to")
    .addNewIssue({
        
        update: issue

    }, function (error, newItem) {
        
        if (error == null)
            defer.resolve(newItem);
        else
            defer.reject(error);

    });
    
    return defer.promise;
};

exports.addCustomField = function (customField, req) {
    
    var defer = Q.defer();
    
    delete customField.id;
    delete customField.custom;
    delete customField.orderable;
    delete customField.navigable;
    delete customField.searchable;
    delete customField.clauseNames;
    
    if (customField.schema)
        customField.type = customField.schema.custom;
    
    delete customField.schema;
    
    this
    .createJira(req, "to")
    .createCustomField(customField, function (error, newItem) {
        
        if (error == null)
            defer.resolve(newItem);
        else
            defer.reject(error);

    });
    
    return defer.promise;
};

exports.addIssueType = function (issueType, req) {
    
    var defer = Q.defer();
    
    delete issueType.self;
    delete issueType.id;
    delete issueType.iconUrl;
    delete issueType.avatarId;
    delete issueType.subtask;
    
    this
    .createJira(req, "to")
    .createIssueType(issueType, function (error, newItem) {
        
        if (error == null)
            defer.resolve(newItem);
        else
            defer.reject(error);

    });
    
    return defer.promise;
};