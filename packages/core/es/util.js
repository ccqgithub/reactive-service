var configSettings = {
    logLevel: 'error',
    log: function (msg, type) {
        if (type === void 0) { type = 'info'; }
        console && console[type] && console[type](msg);
    }
};
export var config = function (args) {
    var keys = Object.keys(configSettings);
    keys.forEach(function (key) {
        if (typeof args[key] !== 'undefined') {
            configSettings[key] = args[key];
        }
    });
};
export var debug = function (msg, type, condition) {
    if (type === void 0) { type = 'info'; }
    if (condition === void 0) { condition = true; }
    if (!condition)
        return;
    var levels = ['info', 'warn', 'error', 'never'];
    if (levels.indexOf(configSettings.logLevel) > levels.indexOf(type))
        return;
    configSettings.log(msg, type);
};
