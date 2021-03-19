declare type DebugFunction = (...args: any[]) => void;
declare type ConfigArgs = {
    debug: DebugFunction;
};
declare let debug: DebugFunction;
export default function config(args: ConfigArgs): void;
export { debug };
