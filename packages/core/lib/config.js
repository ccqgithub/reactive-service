"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debug = void 0;
var debug = function () { };
exports.debug = debug;
function config(args) {
    if (args.debug)
        exports.debug = debug = args.debug;
}
exports.default = config;
