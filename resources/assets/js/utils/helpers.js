exports.getObjectProperty = function(object, property, defaultValue) {
    if ((object == undefined) || (object[property] == undefined)) return defaultValue;
    return object[property];
};

exports.parseForXSS = function(value) {
    return String(value).replace(/[\u00A0-\u9999<>&]/gim, function(i) {
        return '&#' + i.charCodeAt(0) + ';';
    });
};

exports.isValidEmail = function(emailAddress) {
    var re = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
    return re.test(emailAddress);
};
