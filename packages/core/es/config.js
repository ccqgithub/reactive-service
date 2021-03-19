var debug = function () { };
export default function config(args) {
    if (args.debug)
        debug = args.debug;
}
export { debug };
