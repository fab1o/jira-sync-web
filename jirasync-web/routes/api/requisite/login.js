"use strict";

module.exports = exports = function (req, res, next) {
    
    if (req.isLoggedIn) {
        
        next();

    } else {
        
        res.status(400).send("Please login before performing this operation.");
    }

};