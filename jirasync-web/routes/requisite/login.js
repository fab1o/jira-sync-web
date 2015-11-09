"use strict";

module.exports = exports = function (req, res, next) {
    
    if (req.isLoggedIn) {
        
        next();

    } else {
        
        res.redirect("/login?redirectUrl=" + req.originalUrl);
    }

};