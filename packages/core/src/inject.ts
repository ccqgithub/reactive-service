import 'reflect-metadata';

const injectionMetadataKey = Symbol('inject');
/* class AppService {
  constructor(@Inject(MessageService) messageService: MessageService) {
    console.log(messageService.getMessages());
  }
} */
const Inject = (provider: Record<string, any>) => {
  return (
    target: Record<string, any>,
    propertyKey: string | symbol,
    parameterIndex: number
  ): void => {
    if (propertyKey !== undefined) {
      throw new Error('The @inject decorator can only use on consturctor!');
    }
    const existingInjectionParameters: Map<number, Record<string, any>> =
      Reflect.getOwnMetadata(injectionMetadataKey, target, propertyKey) ||
      new Map();
    existingInjectionParameters.set(parameterIndex, provider);
    Reflect.defineMetadata(
      injectionMetadataKey,
      existingInjectionParameters,
      target,
      propertyKey
    );
  };
};

export { Inject, injectionMetadataKey };
