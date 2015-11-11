"use strict";

var request = require("request");

module.exports = exports = function (req, res) {
    
    //if (!res.getHeader("Cache-Control"))
        //res.setHeader("Cache-Control", "public, max-age=129600");
        
    var url = req.query.url;
    
    if (req.query.pid)
        url += "&pid=" + req.query.pid;
    
    if (req.query.avatarId)
        url += "&avatarId=" + req.query.avatarId;
    
    if (req.query.size)
        url += "&size=" + req.query.size;
    
    if (req.query.s)
        url += "&s=" + req.query.s;
    
    if (req.query.ownerId)
        url += "&ownerId=" + req.query.ownerId;
    
    var css = null;
    
    if (req.query.class)
        css = req.query.class;
    
    var options = {
        url: url,
        encoding: null,
        method: "GET",
        headers: {
            "Authorization": (req.query.type == "from") ? req.login.from.basic : req.login.to.basic
        }
    };
    
    request(options, function onSuccess(err, resp, body) {

        if (body.toString().indexOf("svg") == -1)
            if (css)
                res.send("<img class=\"" + css + " img-responsive\" src=\"data:image/jpeg;base64," + body.toString("base64") + "\" />");
            else
                res.send("<img class=\"img-responsive\" src=\"data:image/jpeg;base64," + body.toString("base64") + "\" />");
        else
            res.send(body.toString());
        
    }, function onFail(data) {
        
        res.send("");

    });

};