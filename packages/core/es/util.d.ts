declare type LogType = 'info' | 'warn' | 'error';
declare type LogLevel = 'info' | 'warn' | 'error' | 'never';
declare type LogFunction = (msg: any, type: LogType) => void;
declare type ConfigArgs = {
    logLevel: LogLevel;
    log: LogFunction;
};
export declare const config: (args: ConfigArgs) => void;
export declare const debug: (msg: unknown, type?: LogType, condition?: boolean) => void;
export {};
