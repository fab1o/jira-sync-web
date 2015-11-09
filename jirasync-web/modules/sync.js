"use strict";

var Enumerable = require("linq");
var jira = require("./jira");
var Q = require("q");

exports.componentsAditions = function (req, diff) {
    
    var defer = Q.defer();
    
    var addList = Enumerable.from(diff.components.items).where("$.isNew").toArray();
    
    var addListCount = addList.length;
    
    if (addListCount > 0) {
        
        jira
        .createJira(req, "from")
        .listComponents(diff.keyFrom, function (componentsError, componentsFrom) {
            
            var counter = 0;
            
            for (var i = 0; i < addListCount; i++) {
                
                var component = addList[i];
                var componentFrom = Enumerable.from(componentsFrom).firstOrDefault("$.id == \"" + component.id + "\"", null);
                
                jira
                .addComponent(componentFrom, diff.keyTo, diff.projectIdTo, req)
                .finally(function () {
                    
                    if (counter++ == addListCount) { //ended
                        
                        defer.resolve();
                    }

                });
            }

        });

    } else {
        defer.resolve();
    }
    
    return defer.promise;
};

exports.componentsDeletions = function (req, diff) {
    
    var defer = Q.defer();
    
    var removeList = Enumerable.from(diff.components.items).where("$.isRemoved").toArray();
    
    var removeListCount = removeList.length;
    
    if (removeListCount > 0) {
        
        var counter = 0;
        
        for (var i = 0; i < removeListCount; i++) {
            
            var component = removeList[i];
            
            jira
            .createJira(req, "to")
            .deleteComponent(component.id, function () {
                
                if (counter++ == removeListCount) { //ended
                    
                    defer.resolve();
                }

            });
        }

    } else {
        defer.resolve();
    }
    
    return defer.promise;
};

exports.versionsAditions = function (req, diff) {
    
    var defer = Q.defer();
    
    var addList = Enumerable.from(diff.versions.items).where("$.isNew").toArray();
    
    var addListCount = addList.length;
    
    if (addListCount > 0) {
        
        var counter = 0;
        
        for (var i = 0; i < addListCount; i++) {
            
            var version = addList[i];
            
            jira
            .addVersion(version, diff.keyTo, diff.projectIdTo, req)
            .finally(function () {
                
                if (counter++ == addListCount) { //ended
                    
                    defer.resolve();
                }

            });
        }

    } else {
        defer.resolve();
    }
    
    return defer.promise;
};

exports.versionsDeletions = function (req, diff) {
    
    var defer = Q.defer();
    
    var removeList = Enumerable.from(diff.versions.items).where("$.isRemoved").toArray();
    
    var removeListCount = removeList.length;
    
    if (removeListCount > 0) {
        
        var counter = 0;
        
        for (var i = 0; i < removeListCount; i++) {
            
            var version = removeList[i];
            
            jira
            .createJira(req, "to")
            .deleteVersion(version.id, function () {
                
                if (counter++ == removeListCount) { //ended
                    
                    defer.resolve();
                }

            });
        }

    } else {
        defer.resolve();
    }
    
    return defer.promise;
};