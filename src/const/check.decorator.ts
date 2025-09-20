import { HttpException, HttpStatus, Logger } from '@nestjs/common';

export function CatchErrors() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        Logger.error(error);
        throw new HttpException(
          error.message,
          error instanceof HttpException
            ? error.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    };

    return descriptor;
  };
}
