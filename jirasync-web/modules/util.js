
exports.cloneIssue = function (obj, fields, isFields) {
    
    if (obj === null || typeof obj !== "object") {
        return obj;
    }
    
    var temp = obj.constructor();
    for (var key in obj) {
        
        if (obj.hasOwnProperty(key)) {
            
            if (key == "fields") {
                
                temp[key] = this.cloneIssue(obj[key], fields, true);

            } else if (isFields && fields) {
                
                if (fields.indexOf(key) != -1)
                    temp[key] = this.cloneIssue(obj[key], fields);
            }
            else {
                
                temp[key] = this.cloneIssue(obj[key]);

            }

        }
        
    }
    
    return temp;
};

exports.deleteProperties = function (list, props) {
    
    if (!Array.isArray(list) || !Array.isArray(props))
        return list;
    
    var output = list.slice(0);
    
    for (var i = 0; i < output.length; i++) {
        
        for (p in props) {
            delete output[i][props[p]];
        }
    }

    return output;

};