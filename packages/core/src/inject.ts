import 'reflect-metadata';
import { InjectionProvide, InjectionConstructor } from './types';

export type InjectMetadata<P extends InjectionProvide> = {
  provide: P;
  optional: boolean;
};

const injectMetadataKey = Symbol('inject:constructor:params');
/* class AppService {
  constructor(@Inject(MessageService, { optional: true }) messageService: MessageService) {
    console.log(messageService.getMessages());
  }
} */
const Inject = <P extends InjectionProvide = InjectionProvide>(
  provide: P,
  args: { optional?: boolean } = {}
) => {
  return (
    target: InjectionConstructor,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
  ): void => {
    if (propertyKey !== undefined) {
      throw new Error(
        'The @inject decorator can only be used on consturctor parameters!'
      );
    }
    const existingParameters: InjectMetadata<InjectionProvide>[] =
      Reflect.getOwnMetadata(injectMetadataKey, target) || [];
    existingParameters[parameterIndex] = {
      provide,
      optional: !!args.optional
    } as InjectMetadata<P>;
    Reflect.defineMetadata(injectMetadataKey, existingParameters, target);
  };
};

export default Inject;
export { injectMetadataKey };
