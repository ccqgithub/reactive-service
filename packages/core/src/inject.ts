import 'reflect-metadata';
import { InjectionClass, ConstructorType } from './types';

export type InjectMetadata<P extends InjectionClass> = {
  provide: P;
  optional: boolean;
};

const injectMetadataKey = Symbol('inject:constructor:params');
/* class AppService {
  constructor(@Inject(MessageService, { optional: true }) messageService: MessageService) {
    console.log(messageService.getMessages());
  }
} */
const Inject = <P extends InjectionClass = InjectionClass>(
  provide: P,
  args: { optional?: boolean } = {}
) => {
  return (
    target: ConstructorType<P>,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
  ): void => {
    if (propertyKey !== undefined) {
      throw new Error(
        'The @inject decorator can only be used on consturctor parameters!'
      );
    }
    const existingParameters: InjectMetadata<InjectionClass>[] =
      Reflect.getOwnMetadata(injectMetadataKey, target) || [];
    existingParameters[parameterIndex] = {
      provide,
      optional: !!args.optional
    } as InjectMetadata<P>;
    Reflect.defineMetadata(injectMetadataKey, existingParameters, target);
  };
};

export { Inject, injectMetadataKey };
