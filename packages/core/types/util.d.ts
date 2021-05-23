export declare type LogType = 'info' | 'warn' | 'error';
export declare type LogLevel = 'info' | 'warn' | 'error' | 'never';
export declare type LogFunction = (msg: any, type: LogType) => void;
export declare type ConfigArgs = {
    logLevel: LogLevel;
    log: LogFunction;
};
export declare const config: (args: Partial<ConfigArgs>) => void;
export declare const debug: (msg: unknown, type?: LogType, condition?: boolean) => void;
//# sourceMappingURL=util.d.ts.map