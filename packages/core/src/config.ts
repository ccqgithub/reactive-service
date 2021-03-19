type DebugFunction = (...args: any[]) => void;

type ConfigArgs = {
  debug: DebugFunction;
};

let debug: DebugFunction = () => {};

export default function config(args: ConfigArgs): void {
  if (args.debug) debug = args.debug;
}

export { debug };
